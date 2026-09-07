// VEXIM AI MULTI-AGENT OPERATIONS ENGINE
// Implements 8 Specialized Operations Agents & Orchestrator (Sections 8, 11, 13, 16, 18, 19, 20, 33, 34)

import {
  AccountHealthMetric,
  AIAgentType,
  AIRecommendation,
  CustomerMessage,
  InventoryItem,
  ListingData,
  PpcCampaign,
  PpcKeyword,
  Product,
} from './types'

export class InventoryAgent {
  static analyzeItem(item: InventoryItem, clientName: string): AIRecommendation | null {
    const daysOfSupply = item.fbaAvailable / (item.dailyVelocity7d || 1)
    const seaLeadTime = item.supplierLeadTimeDays || 32

    if (daysOfSupply < seaLeadTime * 0.45) {
      // CRITICAL stockout imminent
      const shortageUnits = Math.round((seaLeadTime * 1.5 - daysOfSupply) * item.dailyVelocity7d)
      const airExpressEmergencyUnits = Math.round(item.dailyVelocity7d * 14) // 14 days buffer
      const seaUnits = shortageUnits - airExpressEmergencyUnits

      return {
        id: `rec-inv-${item.sku}-${Date.now()}`,
        clientId: item.clientId,
        clientName: clientName,
        agentType: 'INVENTORY',
        entityType: 'INVENTORY',
        entityId: item.id,
        entityIdentifier: `${item.sku} (${item.asin})`,
        title: `CẢNH BÁO NGUY CẤP: ${item.sku} dự kiến đứt hàng FBA trong ${daysOfSupply.toFixed(1)} ngày`,
        description: `Tốc độ bán 7 ngày: ${item.dailyVelocity7d} units/ngày. Tồn khả dụng: ${item.fbaAvailable} units. Thời gian nhập hàng đường biển từ Việt Nam cần ${seaLeadTime} ngày.`,
        reason: `Thời gian tồn kho còn lại (${daysOfSupply.toFixed(1)} ngày) thấp hơn đáng kể so với chu kỳ vận chuyển đường biển (${seaLeadTime} ngày). Nếu không xử lý ngay, sản phẩm sẽ mất BSR ranking.`,
        confidenceScore: 97,
        priority: 'CRITICAL',
        riskLevel: 'HIGH',
        proposedAction: `Tạo Purchase Order khẩn cấp: ${seaUnits > 0 ? `${seaUnits} units đường biển` : ''} + ${airExpressEmergencyUnits} units Air Express cứu nguy.`,
        actionData: {
          sku: item.sku,
          seaUnits,
          airExpressEmergencyUnits,
          estimatedCostUsd: Math.round(shortageUnits * item.unitCostUsd),
        },
        beforeState: { availableUnits: item.fbaAvailable, daysOfSupply: Number(daysOfSupply.toFixed(1)) },
        proposedState: { totalReorderUnits: shortageUnits, projectedDaysOfSupply: 60 },
        expectedImpact: `Ngăn ngừa thất thoát ~$${Math.round(shortageUnits * 24.99 * 0.4)} lợi nhuận và duy trì điểm thứ hạng Amazon Best Seller.`,
        requiresExplicitApproval: true,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
      }
    }
    return null
  }
}

export class PPCAgent {
  static analyzeKeyword(
    kw: PpcKeyword,
    campaign: PpcCampaign,
    clientName: string,
    clientId: string
  ): AIRecommendation | null {
    // Bleeding keyword: high spend, high ACOS (> 45%)
    if (kw.acos > 45 && kw.clicks >= 15) {
      const suggestedNewBid = Math.max(0.25, Number((kw.bid * 0.65).toFixed(2)))
      return {
        id: `rec-ppc-cut-${kw.id}-${Date.now()}`,
        clientId: clientId,
        clientName: clientName,
        agentType: 'PPC',
        entityType: 'KEYWORD',
        entityId: kw.id,
        entityIdentifier: `${campaign.campaignName} > "${kw.keywordText}"`,
        title: `Giảm 35% giá thầu từ khóa ACOS cao (${kw.acos.toFixed(1)}% vs Target ${campaign.targetAcos}%)`,
        description: `Từ khóa "${kw.keywordText}" tiêu $${kw.spend} trong tuần qua nhưng chỉ tạo $${kw.sales} doanh thu. Tỷ lệ chuyển đổi chỉ ${kw.conversionRate}%.`,
        reason: `Chi phí mỗi lượt click ($${(kw.spend / kw.clicks).toFixed(2)}) quá cao so với giá trị đơn hàng trung bình. Cần hạ giá thầu để bảo toàn tỷ suất lợi nhuận.`,
        confidenceScore: 93,
        priority: 'HIGH',
        riskLevel: 'LOW',
        proposedAction: `Hạ bid từ $${kw.bid} xuống $${suggestedNewBid} trên chiến dịch ${campaign.campaignName}.`,
        actionData: {
          keywordId: kw.id,
          campaignId: campaign.id,
          currentBid: kw.bid,
          newBid: suggestedNewBid,
        },
        beforeState: { bid: kw.bid, acos: kw.acos, weeklySpend: kw.spend },
        proposedState: { bid: suggestedNewBid, projectedAcos: campaign.targetAcos, weeklySavings: Math.round(kw.spend * 0.4) },
        expectedImpact: `Tiết kiệm ước tính ~$${Math.round(kw.spend * 1.6)}/tháng ngân sách quảng cáo không hiệu quả.`,
        requiresExplicitApproval: true,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
      }
    }

    // High converter scaling opportunity: low ACOS (< 20%), high CVR (> 20%)
    if (kw.acos < 20 && kw.conversionRate > 20 && kw.orders >= 5) {
      const suggestedNewBid = Number((kw.bid * 1.15).toFixed(2))
      return {
        id: `rec-ppc-scale-${kw.id}-${Date.now()}`,
        clientId: clientId,
        clientName: clientName,
        agentType: 'PPC',
        entityType: 'KEYWORD',
        entityId: kw.id,
        entityIdentifier: `${campaign.campaignName} > "${kw.keywordText}"`,
        title: `Tăng 15% bid từ khóa tỷ lệ chuyển đổi cao (${kw.conversionRate}% CVR, ACOS ${kw.acos.toFixed(1)}%)`,
        description: `Từ khóa "${kw.keywordText}" đang có hiệu suất sinh lời rất cao với ACOS chỉ ${kw.acos.toFixed(1)}%.`,
        reason: `Tăng giá thầu để giành tỷ lệ hiển thị Top of Search (#1 tài trợ) và scale số lượng đơn hàng bán ra.`,
        confidenceScore: 95,
        priority: 'OPPORTUNITY',
        riskLevel: 'LOW',
        proposedAction: `Tăng bid từ $${kw.bid} lên $${suggestedNewBid}.`,
        actionData: {
          keywordId: kw.id,
          campaignId: campaign.id,
          currentBid: kw.bid,
          newBid: suggestedNewBid,
        },
        beforeState: { bid: kw.bid, acos: kw.acos, weeklyOrders: kw.orders },
        proposedState: { bid: suggestedNewBid, projectedOrders: Math.round(kw.orders * 1.5) },
        expectedImpact: `Dự kiến tăng thêm +${Math.round(kw.orders * 2)} đơn hàng/tháng với biên lợi nhuận ròng > 40%.`,
        requiresExplicitApproval: true,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
      }
    }

    return null
  }
}

export class CustomerSafetyAgent {
  static classifyMessage(body: string): {
    classification: CustomerMessage['classification']
    isSafetyCritical: boolean
    safetyKeywords: string[]
    recommendedAction: string
  } {
    const safetyKeywordsList = [
      'injury',
      'hurt',
      'blood',
      'scratch',
      'splinter',
      'allergic',
      'allergy',
      'reaction',
      'burn',
      'toxic',
      'poison',
      'contamination',
      'mold',
      'glass',
      'metal shard',
      'cpsc',
      'fda',
      'lawsuit',
      'hospital',
      'emergency',
    ]

    const lower = body.toLowerCase()
    const detectedSafety = safetyKeywordsList.filter((k) => lower.includes(k))

    if (detectedSafety.length > 0) {
      return {
        classification: 'SAFETY_CRITICAL',
        isSafetyCritical: true,
        safetyKeywords: detectedSafety,
        recommendedAction:
          'BLOCK AUTO-REPLY: Yêu cầu Operations Lead và Compliance Manager kiểm tra ngay trong 2 giờ theo quy chuẩn an toàn sản phẩm Amazon.',
      }
    }

    if (lower.includes('refund') || lower.includes('return') || lower.includes('money back')) {
      return {
        classification: 'REFUND_REQUEST',
        isSafetyCritical: false,
        safetyKeywords: [],
        recommendedAction: 'Tạo bản nháp hoàn tiền / hướng dẫn đổi trả chuẩn mực CS Amazon.',
      }
    }

    if (lower.includes('broken') || lower.includes('damaged') || lower.includes('defect') || lower.includes('smell')) {
      return {
        classification: 'PRODUCT_QUALITY',
        isSafetyCritical: false,
        safetyKeywords: [],
        recommendedAction: 'Gửi bản nháp xin lỗi kèm cam kết gửi gói thay thế FBA.',
      }
    }

    return {
      classification: 'NORMAL_INQUIRY',
      isSafetyCritical: false,
      safetyKeywords: [],
      recommendedAction: 'Phản hồi giải đáp thông tin sản phẩm và tư vấn sử dụng.',
    }
  }
}

export class ListingOptimizerAgent {
  static generateOptimizationProposal(listing: ListingData, product: Product): AIRecommendation {
    return {
      id: `rec-list-opt-${listing.id}`,
      clientId: product.clientId,
      clientName: product.brand,
      agentType: 'LISTING',
      entityType: 'LISTING',
      entityId: listing.id,
      entityIdentifier: `${listing.sku} (${listing.asin})`,
      title: `Tối ưu hóa Listing Amazon V2 cho ${product.title.slice(0, 45)}...`,
      description: `Bổ sung các cụm từ khóa có lượng tìm kiếm cao (High Search Volume), chuẩn hóa 5 Bullet Points nêu rõ chứng nhận xuất xứ Việt Nam và giải quyết các điểm yếu đối thủ.`,
      reason: `Listing hiện tại có điểm chất lượng ${listing.currentScore.overall}/100. Dự kiến sau khi tối ưu sẽ đạt ${listing.aiOptimizationDraft?.projectedScore || 95}/100.`,
      confidenceScore: 94,
      priority: 'OPPORTUNITY',
      riskLevel: 'LOW',
      proposedAction: `Phê duyệt và áp dụng bản cập nhật Listing Draft lên Amazon SP-API.`,
      actionData: {
        listingId: listing.id,
        sku: listing.sku,
        asin: listing.asin,
      },
      beforeState: { score: listing.currentScore.overall, titleLength: listing.title.length },
      proposedState: {
        score: listing.aiOptimizationDraft?.projectedScore || 95,
        titleLength: listing.aiOptimizationDraft?.title.length || 175,
      },
      expectedImpact: `Dự kiến cải thiện tỷ lệ nhấp chuột CTR +14% và tỷ lệ chuyển đổi CVR +18%.`,
      requiresExplicitApproval: true,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
    }
  }
}

export class ComplianceGatekeeperAgent {
  static evaluateProductReadiness(product: Product): {
    score: number
    canLaunch: boolean
    blockers: string[]
    recommendations: string[]
  } {
    const blockers: string[] = []
    const recommendations: string[] = []

    // Check critical compliance issues
    const criticalIssues = product.complianceIssues.filter((i) => i.severity === 'CRITICAL_BLOCK' && !i.isResolved)
    if (criticalIssues.length > 0) {
      criticalIssues.forEach((issue) => blockers.push(`[BLOCKER] ${issue.title}: ${issue.description}`))
    }

    // Check mandatory documents
    const hasFDA = product.documents.some((d) => d.type === 'FDA_REGISTRATION' && d.status === 'VERIFIED')
    const hasCOA = product.documents.some((d) => d.type === 'COA' && d.status === 'VERIFIED')

    if (product.category.includes('Food') || product.category.includes('Grocery')) {
      if (!hasFDA) blockers.push('[BLOCKER] Thiếu chứng nhận đăng ký cơ sở thực phẩm FDA Hoa Kỳ 2026.')
      if (!hasCOA) blockers.push('[BLOCKER] Thiếu phiếu kiểm nghiệm thành phần và vi sinh COA.')
    }

    // Check images
    if (!product.mainImage || product.galleryImages.length < 3) {
      recommendations.push('Nên bổ sung tối thiểu 5 ảnh chất lượng cao 2000x2000px để bật tính năng Zoom.')
    }

    const overallScore = Math.max(40, 100 - blockers.length * 20 - recommendations.length * 5)
    const canLaunch = blockers.length === 0 && overallScore >= 80

    return {
      score: overallScore,
      canLaunch,
      blockers,
      recommendations,
    }
  }
}

export class AIOperationsOrchestrator {
  static runComprehensiveScan(
    inventory: InventoryItem[],
    campaigns: PpcCampaign[],
    keywords: PpcKeyword[],
    listings: ListingData[],
    products: Product[],
    clientNameMap: Record<string, string>
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []

    // 1. Scan Inventory items
    for (const item of inventory) {
      const rec = InventoryAgent.analyzeItem(item, clientNameMap[item.clientId] || 'Nhà cung cấp')
      if (rec) recommendations.push(rec)
    }

    // 2. Scan PPC
    for (const kw of keywords) {
      const camp = campaigns.find((c) => c.id === kw.campaignId)
      if (camp) {
        const rec = PPCAgent.analyzeKeyword(kw, camp, clientNameMap[camp.clientId] || 'Nhà cung cấp', camp.clientId)
        if (rec) recommendations.push(rec)
      }
    }

    return recommendations
  }
}
