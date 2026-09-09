import { supabase, isSupabaseConfigured } from './supabase'
import { computeReadiness } from './readiness-engine'
import {
  AIRecommendation,
  AuditLogEntry,
  ClientSupplier,
  FreightRateCard,
  InventoryItem,
  Order,
  OperationalTask,
  Product,
  TeamMember,
  UserRole,
} from './types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Ảnh fallback theo SKU (cột main_image nằm ở bảng products, không ở inventory) */
const SKU_IMAGE_FALLBACKS: Record<string, string> = {
  'VXM-COCOA-70DK': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
  'VXM-COCOA-PWD500': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&auto=format&fit=crop&q=80',
  'VXM-INC-AGAR100': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&auto=format&fit=crop&q=80',
}

/** Tách ngày dd/mm/yyyy (hoặc yyyy-mm-dd) từ chuỗi dạng 'Cát Lái (HCMC) - 15/09/2026' */
function extractDateLoose(text: string | null | undefined): string | null {
  if (!text) return null
  const dmy = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  const ymd = text.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`
  return null
}

export class SupabaseDatabaseService {
  // 1. Fetch Users / Team Members from Supabase
  static async getUsers(): Promise<TeamMember[] | null> {
    if (!isSupabaseConfigured()) return null
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true })

      if (error || !data || data.length === 0) return null

      return data.map((u: any) => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        password: '••••••••',
        role: u.role as UserRole,
        department: u.department || 'Vận Hành Vexim',
        title: u.title || u.department,
        phone: u.phone || '+84 988 888 888',
        assignedClientIds: u.client_id ? [u.client_id] : ['ALL'],
        canApproveHighRisk: !!u.can_approve_high_risk,
        status: u.is_active ? 'ACTIVE' : 'SUSPENDED',
        lastActive: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleTimeString('vi-VN') : 'Gần đây',
        twoFactorEnabled: !!u.two_factor_enabled,
        createdAt: u.created_at,
      }))
    } catch (err) {
      console.warn('[Supabase] getUsers error:', err)
      return null
    }
  }

  // 2. Create or Update Staff User on Supabase
  static async createStaffUser(user: TeamMember): Promise<boolean> {
    if (!isSupabaseConfigured()) return false
    try {
      const { error } = await supabase.from('users').upsert(
        {
          id: user.id.startsWith('user-') ? undefined : user.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          department: user.department,
          title: user.title,
          phone: user.phone,
          can_approve_high_risk: user.canApproveHighRisk,
          is_active: user.status === 'ACTIVE',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

      if (error) {
        console.warn('[Supabase] createStaffUser error:', error)
        return false
      }
      return true
    } catch (err) {
      console.warn('[Supabase] createStaffUser catch error:', err)
      return false
    }
  }

  // 3. Update User Role on Supabase
  static async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    if (!isSupabaseConfigured()) return false
    try {
      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)

      return !error
    } catch (err) {
      return false
    }
  }

  // 4. Fetch Clients
  static async getClients(): Promise<ClientSupplier[] | null> {
    if (!isSupabaseConfigured()) return null
    try {
      const { data, error } = await supabase.from('clients').select('*')
      if (error || !data || data.length === 0) return null
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        companyName: c.company_name,
        taxCode: c.tax_code,
        contactPerson: c.contact_person,
        email: c.email,
        phone: c.phone,
        province: c.province,
        category: c.category,
        serviceTier: c.service_tier,
        joinedAt: c.created_at?.slice(0, 10) || '2026-01-01',
        amazonSellerId: c.amazon_seller_id,
        amazonStoreName: c.amazon_store_name,
        connectionStatus: c.connection_status || 'CONNECTED',
        activeSkuCount: 12,
        monthlyRevenue: 68420,
        growthRate: 18.4,
        readinessAverage: 92,
      }))
    } catch (err) {
      return null
    }
  }

  // 5. Fetch Products
  static async getProducts(clientId?: string): Promise<Product[] | null> {
    if (!isSupabaseConfigured()) return null
    try {
      let query = supabase.from('products').select('*')
      if (clientId && clientId !== 'ALL') {
        query = query.eq('client_id', clientId)
      }
      const { data, error } = await query
      if (error || !data || data.length === 0) return null
      return data.map((p: any) => ({
        id: p.id,
        clientId: p.client_id,
        sku: p.sku,
        asin: p.asin,
        fnsku: p.fnsku || '',
        upc: p.upc || '',
        title: p.title,
        brand: p.brand,
        category: p.category,
        subCategory: p.sub_category || '',
        mainImage: p.main_image || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500',
        galleryImages: p.gallery_images || [],
        price: Number(p.price),
        cogs: Number(p.cogs),
        fbaFeeEstimated: Number(p.fba_fee_estimated || 4.85),
        referralFeeEstimated: Number(p.referral_fee_estimated || 3.75),
        estimatedMargin: Number(p.estimated_margin_pct || 40.8),
        weightLbs: Number(p.weight_lbs || 0.95),
        dimensionsInches: p.dimensions_inches || { length: 7, width: 3, height: 2 },
        status: p.status || 'ACTIVE',
        // Sprint audit: CHẤM THẬT bằng readiness-engine từ dữ liệu row DB
        // (trước đây hardcode canLaunch:true cho MỌI sản phẩm — nguy hiểm khi ra quyết định launch)
        readinessScore: computeReadiness({
          title: p.title,
          brand: p.brand,
          category: p.category,
          subCategory: p.sub_category || '',
          mainImage: p.main_image || '',
          galleryImages: p.gallery_images || [],
          price: Number(p.price),
          cogs: Number(p.cogs),
          fbaFeeEstimated: Number(p.fba_fee_estimated || 0),
          referralFeeEstimated: Number(p.referral_fee_estimated || 0),
          estimatedMargin: Number(p.estimated_margin_pct || 0),
          weightLbs: Number(p.weight_lbs || 0),
          dimensionsInches: p.dimensions_inches || { length: 0, width: 0, height: 0 },
          upc: p.upc || '',
          fnsku: p.fnsku || '',
          documents: [],
          complianceIssues: [],
        }),
        documents: [],
        complianceIssues: [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }))
    } catch (err) {
      return null
    }
  }

  // 6. Save Recommendation Update
  static async updateRecommendation(
    id: string,
    status: AIRecommendation['status'],
    actorRole: string,
    notes?: string
  ) {
    if (!isSupabaseConfigured()) return
    try {
      await supabase
        .from('ai_recommendations')
        .update({
          status,
          approved_by: actorRole,
          approved_at: status === 'APPROVED' ? new Date().toISOString() : null,
          rejected_by: status === 'REJECTED' ? actorRole : null,
          rejected_at: status === 'REJECTED' ? new Date().toISOString() : null,
          reject_reason: notes,
        })
        .eq('id', id)
    } catch (err) {
      console.warn('[Supabase] updateRecommendation error:', err)
    }
  }

  // 7. Save Task
  static async createTask(task: OperationalTask) {
    if (!isSupabaseConfigured()) return
    try {
      await supabase.from('tasks').insert({
        client_id: task.clientId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigned_to: task.assignedTo,
        assigned_role: task.assignedRole,
        due_date: task.dueDate,
        source: task.source,
      })
    } catch (err) {
      console.warn('[Supabase] createTask error:', err)
    }
  }

  // 8. Save Activity / Audit Log
  static async createAuditLog(log: AuditLogEntry) {
    if (!isSupabaseConfigured()) return
    try {
      await supabase.from('activity_logs').insert({
        actor_name: log.actorName,
        actor_role: log.actorRole,
        source: log.source,
        agent_type: log.agentType,
        action_type: log.actionType,
        entity_type: log.entityType,
        entity_id: log.entityId,
        entity_name: log.entityName,
        before_value: log.beforeValue,
        after_value: log.afterValue,
        approval_notes: log.approvalNotes,
        ip_address: log.ipAddress,
      })
    } catch (err) {
      console.warn('[Supabase] createAuditLog error:', err)
    }
  }

  // ====================================================================
  // 9. SUPPLY CHAIN HUB — TỒN KHO, GIÁ CƯỚC, VẬN ĐƠN INBOUND (B/L)
  // ====================================================================

  /** Đọc tồn kho FBA từ bảng `inventory` (nguồn sự thật), ghép cogs + ảnh từ `products`. */
  static async getInventory(): Promise<InventoryItem[] | null> {
    if (!isSupabaseConfigured()) return null
    try {
      const { data, error } = await supabase.from('inventory').select('*')
      if (error) {
        console.warn('[Supabase] getInventory error:', error.message)
        return null
      }
      if (!data || data.length === 0) return null

      // Ghép unit cost + ảnh từ bảng products (theo sku)
      const { data: prods } = await supabase.from('products').select('sku, cogs, main_image')
      const prodMap = new Map<string, { cogs?: number; mainImage?: string }>()
      for (const p of prods || []) {
        prodMap.set(p.sku, { cogs: p.cogs ? Number(p.cogs) : undefined, mainImage: p.main_image })
      }

      return data.map((row: any) => {
        const prod = prodMap.get(row.sku) || {}
        const unitCost = prod.cogs ?? 0
        const leadTimeDays = row.supplier_lead_time_days || 30
        return {
          id: row.id,
          clientId: row.client_id,
          sku: row.sku,
          asin: row.asin,
          title: row.title,
          imageUrl: prod.mainImage || SKU_IMAGE_FALLBACKS[row.sku] || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&auto=format&fit=crop&q=80',
          fbaAvailable: row.fba_available || 0,
          fbaReserved: row.fba_reserved || 0,
          fbaInbound: row.fba_inbound || 0,
          dailyVelocity7d: Number(row.daily_velocity_7d || 0),
          dailyVelocity14d: row.daily_velocity_14d != null ? Number(row.daily_velocity_14d) : undefined,
          dailyVelocity30d: Number(row.daily_velocity_30d || 0),
          daysOfSupply: Number(row.days_of_supply || 0),
          supplierLeadTimeDays: leadTimeDays,
          reorderPointDays: leadTimeDays + 3,
          reorderPointUnits: row.reorder_point_units || 0,
          riskLevel: row.risk_level || 'HEALTHY',
          inventoryValueUsd: Number(((row.fba_available || 0) * unitCost).toFixed(2)),
          unitCostUsd: unitCost,
          recommendedReorderQty: row.recommended_reorder_qty || 0,
          estimatedStockoutDate: row.estimated_stockout_date || null,
          lastRestockedDate: row.last_restocked_at ? String(row.last_restocked_at).slice(0, 10) : '',
          supplierReadyStatus: row.supplier_ready_status || undefined,
          supplierReadyDate: row.supplier_ready_date || undefined,
          supplierReadyQty: row.supplier_ready_qty || undefined,
          supplierReadyNotes: row.supplier_ready_notes || undefined,
        } as InventoryItem
      })
    } catch (err) {
      console.warn('[Supabase] getInventory catch:', err)
      return null
    }
  }

  /** Đọc đơn hàng từ bảng `orders` (dữ liệu sync thật từ Amazon SP-API). */
  static async getOrders(): Promise<Order[] | null> {
    if (!isSupabaseConfigured()) return null
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('purchase_date', { ascending: false })
        .limit(200)
      if (error) {
        console.warn('[Supabase] getOrders error:', error.message)
        return null
      }
      if (!data || data.length === 0) return null
      return data.map((o: any) => ({
        id: o.id,
        amazonOrderId: o.amazon_order_id,
        clientId: o.client_id,
        purchaseDate: o.purchase_date,
        orderStatus: o.order_status,
        fulfillmentChannel: o.fulfillment_channel === 'FBM' ? 'FBM' : 'FBA',
        salesChannel: 'Amazon.com',
        orderTotal: Number(o.order_total || 0),
        itemCount: o.item_count || 1,
        customerCity: o.customer_city || '',
        customerState: o.customer_state || '',
        customerPostalCode: o.customer_postal_code || '',
        carrier: o.carrier || undefined,
        trackingNumber: o.tracking_number || undefined,
        items: Array.isArray(o.items) ? o.items : [],
        hasProblem: !!o.has_problem,
        problemReason: o.problem_reason || undefined,
        aiProblemDiagnosis: o.ai_problem_diagnosis || undefined,
      })) as Order[]
    } catch (err) {
      console.warn('[Supabase] getOrders catch:', err)
      return null
    }
  }

  /** Đọc bảng giá cước vận tải từ `freight_rate_cards` (thay DEFAULT_RATE_CARDS hardcode). */
  static async getFreightRateCards(): Promise<FreightRateCard[] | null> {
    if (!isSupabaseConfigured()) return null
    try {
      const { data, error } = await supabase
        .from('freight_rate_cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (error) {
        console.warn('[Supabase] getFreightRateCards error:', error.message)
        return null
      }
      if (!data || data.length === 0) return null
      return data.map((r: any) => ({
        id: r.id,
        carrierPartnerName: r.carrier_partner_name,
        transportMode: r.transport_mode,
        originPort: r.origin_port,
        destinationPort: r.destination_port,
        ratePerCbmUsd: r.rate_per_cbm_usd != null ? Number(r.rate_per_cbm_usd) : undefined,
        ratePerKgUsd: r.rate_per_kg_usd != null ? Number(r.rate_per_kg_usd) : undefined,
        ratePerContainerUsd: r.rate_per_container_usd != null ? Number(r.rate_per_container_usd) : undefined,
        estimatedTransitDays: r.estimated_transit_days,
        customsClearanceDaysEst: r.customs_clearance_days_est,
        validUntil: r.valid_until,
        fuelSurchargePercent: Number(r.fuel_surcharge_percent || 0),
        documentationFeeUsd: Number(r.documentation_fee_usd || 0),
        drayageEstUsd: Number(r.drayage_est_usd || 0),
      }))
    } catch (err) {
      console.warn('[Supabase] getFreightRateCards catch:', err)
      return null
    }
  }

  /**
   * GHI Book Tàu (B/L) vào bảng `inbound_shipments`.
   * Trả về mã vận đơn (shipment_code) nếu thành công, null nếu thất bại.
   */
  static async upsertInboundShipment(params: {
    clientId?: string
    sku: string
    carrierName: string
    billOfLadingNumber: string
    fbaShipmentId: string
    pickupDateTime: string
    etdPort: string
    etaFba: string
    units?: number
    unitCostUsd?: number
    createdBy?: string
  }): Promise<string | null> {
    if (!isSupabaseConfigured()) return null
    try {
      // Resolve client_id: chỉ nhận UUID hợp lệ, fallback lấy client đầu tiên trong DB
      let clientId: string | null = null
      if (params.clientId && UUID_REGEX.test(params.clientId)) {
        clientId = params.clientId
      } else {
        const { data: firstClient } = await supabase.from('clients').select('id').limit(1).maybeSingle()
        clientId = firstClient?.id || null
      }
      if (!clientId) {
        console.warn('[Supabase] upsertInboundShipment: no client resolved, skip DB write')
        return null
      }

      const year = new Date().getFullYear()
      const random = Math.random().toString(36).slice(2, 6).toUpperCase()
      const units = params.units ?? 0
      const unitCost = params.unitCostUsd ?? 0
      const shipmentCode = `VXM-SHP-${year}-${random}`

      const { error } = await supabase.from('inbound_shipments').insert({
        client_id: clientId,
        shipment_code: shipmentCode,
        fba_shipment_id: params.fbaShipmentId || null,
        status: 'BOOKED',
        transport_mode: params.carrierName.includes('AIR') ? 'AIR_EXPRESS' : params.carrierName.includes('FCL') ? 'OCEAN_FCL_40HC' : 'OCEAN_LCL',
        forwarder_name: params.carrierName,
        bill_of_lading_number: params.billOfLadingNumber,
        origin_port: (params.etdPort || '').split(' - ')[0] || null,
        destination_fba_hub: (params.etaFba || '').match(/ONT\d|LGB\d|LAX\d/)?.[0] || null,
        total_units: units,
        total_fob_value_usd: Number((units * unitCost).toFixed(2)),
        etd_date: extractDateLoose(params.etdPort),
        eta_date: extractDateLoose(params.etaFba),
      })

      if (error) {
        console.warn('[Supabase] upsertInboundShipment error:', error.message)
        return null
      }
      return shipmentCode
    } catch (err) {
      console.warn('[Supabase] upsertInboundShipment catch:', err)
      return null
    }
  }

  /** Ghi event tracking từ webhook forwarder vào `forwarder_tracking_events`. */
  static async insertTrackingEvent(event: {
    carrierName: string
    trackingNumber: string
    eventType: string
    locationName?: string
    statusNotesVi?: string
    rawPayload?: Record<string, any>
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false
    try {
      const { error } = await supabase.from('forwarder_tracking_events').insert({
        carrier_name: event.carrierName,
        tracking_number: event.trackingNumber,
        event_type: event.eventType,
        location_name: event.locationName || null,
        status_notes_vi: event.statusNotesVi || null,
        raw_payload: event.rawPayload || {},
        event_timestamp: new Date().toISOString(),
      })
      if (error) {
        console.warn('[Supabase] insertTrackingEvent error:', error.message)
        return false
      }
      return true
    } catch (err) {
      console.warn('[Supabase] insertTrackingEvent catch:', err)
      return false
    }
  }
}
