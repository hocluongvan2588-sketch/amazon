import { supabase, isSupabaseConfigured } from './supabase'
import {
  getSPApiCredentials,
  spApiFetch,
  spSyncOrders,
  spSyncInventory,
  SPApiError,
  type SPApiCredentials,
} from './sp-api-server'

// ====================================================================
// VEXIM AMAZON → SUPABASE SYNC SERVICE (SERVER-ONLY)
// Giai đoạn 2: Pull dữ liệu THẬT từ SP-API rồi PERSIST vào Supabase.
//  - syncOrdersToDatabase(): /orders/v0 -> bảng `orders` (upsert theo amazon_order_id)
//  - updateInventoryFromAmazon(): /fba/inventory/v1 -> cập nhật fba_available
//    CHO CÁC SKU ĐÃ CÓ trong bảng inventory (không mù quáng insert SKU lạ)
// Quy ước: CHỈ chạy khi LIVE mode (đủ credentials). Simulated KHÔNG BAO GIỜ ghi DB.
// Client attribution: env AMAZON_SYNC_CLIENT_ID (UUID) hoặc client đầu tiên trong DB.
// ====================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveSyncClientId(creds: SPApiCredentials): Promise<string | null> {
  const envClient = process.env.AMAZON_SYNC_CLIENT_ID
  if (envClient && UUID_REGEX.test(envClient)) return envClient
  if (!isSupabaseConfigured()) return null
  const { data } = await supabase.from('clients').select('id').limit(1).maybeSingle()
  return data?.id || null
}

export interface OrdersSyncResult {
  fetched: number
  inserted: number
  updated: number
  itemsEnriched: number
  dbWritten: boolean
  dbError?: string
}

/** Lấy đơn hàng 7 ngày từ Amazon + upsert vào bảng `orders`. */
export async function syncOrdersToDatabase(
  creds: SPApiCredentials
): Promise<OrdersSyncResult> {
  // 1. Pull từ Amazon (tái dùng logic fetch + chuẩn hoá trạng thái)
  const createdAfter = new Date(Date.now() - 7 * 86400_000).toISOString()
  const res = await spApiFetch(creds, '/orders/v0/orders', {
    MarketplaceIds: creds.marketplaceId,
    CreatedAfter: createdAfter,
    MaxResults: '50',
    OrderStatuses:
      'PendingAvailability,Pending,Shipped,PartiallyShipped,Unshipped,InvoiceUnconfirmed,Canceled,Unfulfillable',
  })
  if (!res.ok) {
    throw new SPApiError(
      'ORDERS_SYNC_FAILED',
      res.status,
      `HTTP ${res.status}: ${JSON.stringify(res.json?.errors?.[0] || {}).slice(0, 300)}`
    )
  }
  const orders: any[] = res.json?.payload?.Orders || []

  const result: OrdersSyncResult = {
    fetched: orders.length,
    inserted: 0,
    updated: 0,
    itemsEnriched: 0,
    dbWritten: false,
  }

  if (orders.length === 0 || !isSupabaseConfigured()) return result

  // 2. Client attribution
  const clientId = await resolveSyncClientId(creds)
  if (!clientId) {
    result.dbError = 'Không xác định được client_id (thêm AMAZON_SYNC_CLIENT_ID hoặc seed bảng clients)'
    return result
  }

  // 3. Lấy amazon_order_id đã tồn tại để phân biệt insert/update
  const amazonIds = orders.map((o) => o.AmazonOrderId)
  const { data: existing } = await supabase
    .from('orders')
    .select('amazon_order_id')
    .in('amazon_order_id', amazonIds)
  const existingSet = new Set((existing || []).map((r: any) => r.amazon_order_id))

  // 4. Map + upsert từng đơn
  for (const o of orders) {
    const row = {
      amazon_order_id: o.AmazonOrderId,
      client_id: clientId,
      purchase_date: o.PurchaseDate,
      order_status: mapOrderStatus(o.OrderStatus),
      fulfillment_channel: o.FulfillmentChannel === 'MFN' ? 'FBM' : 'FBA',
      order_total: Number(o.OrderTotal?.Amount ?? 0),
      item_count: Number(o.NumberOfItemsShipped ?? 0) + Number(o.NumberOfItemsUnshipped ?? 0) || 1,
      // LƯU Ý PII: buyer info (tên/địa chỉ/phone) CHỈ lấy khi có phê duyệt PII + RDT
      customer_city: null,
      customer_state: o.Shipment?.StateOrRegion || null,
      customer_postal_code: o.Shipment?.PostalCode || null,
      has_problem: false,
      items: [],
    }
    const { error } = await supabase.from('orders').upsert(row, {
      onConflict: 'amazon_order_id',
      ignoreDuplicates: false,
    })
    if (error) {
      result.dbError = error.message
      continue
    }
    if (existingSet.has(o.AmazonOrderId)) result.updated += 1
    else result.inserted += 1
  }
  result.dbWritten = result.inserted + result.updated > 0
  return result
}

function mapOrderStatus(s: string): string {
  switch (s) {
    case 'Canceled':
      return 'CANCELLED'
    case 'Shipped':
    case 'PartiallyShipped':
      return 'SHIPPED'
    case 'Pending':
    case 'PendingAvailability':
      return 'PENDING'
    case 'Unshipped':
    case 'InvoiceUnconfirmed':
      return 'UNSHIPPED'
    case 'Unfulfillable':
      return 'REFUNDED'
    default:
      return 'PENDING'
  }
}

export interface InventorySyncResult {
  skuCount: number
  totalQuantity: number
  skusUpdated: number
  skusSkipped: number
  dbWritten: boolean
  dbError?: string
}

/**
 * Cập nhật tồn kho FBA THẬT vào bảng `inventory` (chỉ UPDATE SKU đã có,
 * không insert SKU lạ để tránh hỏng dữ liệu nghiệp vụ).
 */
export async function updateInventoryFromAmazon(
  creds: SPApiCredentials
): Promise<InventorySyncResult> {
  const summary = await spSyncInventory(creds) // throw nếu Amazon lỗi
  const result: InventorySyncResult = {
    skuCount: summary.skuCount,
    totalQuantity: summary.totalQuantity,
    skusUpdated: 0,
    skusSkipped: 0,
    dbWritten: false,
  }

  if (!isSupabaseConfigured()) {
    result.dbError = 'Supabase chưa cấu hình'
    return result
  }

  // Pull chi tiết summaries lần nữa để có per-SKU quantity (spSyncInventory chỉ trả tổng)
  const res = await spApiFetch(creds, '/fba/inventory/v1/summaries', {
    marketplaceIds: creds.marketplaceId,
    details: 'true',
  })
  if (!res.ok) {
    result.dbError = `HTTP ${res.status} khi lấy chi tiết SKU`
    return result
  }
  const summaries: any[] = res.json?.payload?.inventorySummaries || []

  for (const s of summaries) {
    const sku: string | undefined = s?.sellerSku
    const qty = Number(s?.totalQuantity ?? 0)
    if (!sku) continue
    const { data, error } = await supabase
      .from('inventory')
      .update({ fba_available: qty, updated_at: new Date().toISOString() })
      .eq('sku', sku)
      .select('id')
    if (error) {
      result.dbError = error.message
      continue
    }
    if (data && data.length > 0) result.skusUpdated += 1
    else result.skusSkipped += 1
  }
  result.dbWritten = result.skusUpdated > 0
  return result
}
