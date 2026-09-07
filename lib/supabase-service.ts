import { supabase, isSupabaseConfigured } from './supabase'
import {
  AIRecommendation,
  AuditLogEntry,
  ClientSupplier,
  InventoryItem,
  OperationalTask,
  Product,
} from './types'

export class SupabaseDatabaseService {
  // 1. Fetch Clients
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
      console.warn('[Supabase] Falling back to local state:', err)
      return null
    }
  }

  // 2. Fetch Products
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
        readinessScore: {
          overall: p.readiness_score || 90,
          productInfo: 95,
          listingQuality: 90,
          mediaAssets: 90,
          keywordCoverage: 88,
          pricingCompetitiveness: 92,
          complianceScore: 95,
          documentationScore: 90,
          blockersCount: 0,
          canLaunch: true,
          recommendations: ['Đã đồng bộ từ Supabase Database'],
        },
        documents: [],
        complianceIssues: [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }))
    } catch (err) {
      return null
    }
  }

  // 3. Save Recommendation Update
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

  // 4. Save Task
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

  // 5. Save Activity / Audit Log
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
}
