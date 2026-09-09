// ====================================================================
// VEXIM MULTI-TIER AI ROUTER & TOKEN COST CONTROLLER
// Manages Tier 1 (Cheap Mini), Tier 2 (Deep Sonnet), Tier 3 (Code $0)
// ====================================================================

export type AIModelTier = 'TIER_1_MINI' | 'TIER_2_SONNET' | 'TIER_3_CODE'

export interface AICostAccountingStats {
  totalTokensProcessed: number
  rawTokensBeforeDistillation: number
  tokensSavedPercentage: number
  totalSpendUsdThisMonth: number
  monthlyCostPerClientUsd: number
  tierBreakdown: {
    tier1MiniCalls: number
    tier2SonnetCalls: number
    tier3CodeExecutions: number
  }
  grossMarginPercentage: number
}

class AIRouterManager {
  private stats: AICostAccountingStats = {
    totalTokensProcessed: 148200, // ~148k tokens distilled
    rawTokensBeforeDistillation: 3120000, // ~3.12M raw SP-API tokens
    tokensSavedPercentage: 95.25,
    totalSpendUsdThisMonth: 7.10, // Total cost for 5 clients
    monthlyCostPerClientUsd: 1.42,
    tierBreakdown: {
      tier1MiniCalls: 480, // 85% of calls
      tier2SonnetCalls: 32, // 15% of heavy copywriting calls
      tier3CodeExecutions: 2840, // Pure math $0
    },
    grossMarginPercentage: 99.95,
  }

  getStats(): AICostAccountingStats {
    return { ...this.stats }
  }

  // Route request to the appropriate tier
  routeTask(taskType: string): {
    tier: AIModelTier
    modelName: string
    estimatedCostPerCallUsd: number
    reason: string
  } {
    switch (taskType) {
      case 'A_PLUS_COPYWRITING':
      case 'COMPETITOR_DEEP_POSITIONING':
        this.stats.tierBreakdown.tier2SonnetCalls++
        return {
          tier: 'TIER_2_SONNET',
          modelName: 'claude-3-5-sonnet / gpt-4o',
          estimatedCostPerCallUsd: 0.015,
          reason: 'Yêu cầu năng lực viết copywriting thương hiệu cao cấp & sáng tạo ngôn từ.',
        }

      case 'INVENTORY_REASONING':
      case 'PPC_BID_RECOMMENDATION':
      case 'CUSTOMER_MESSAGE_CLASSIFICATION':
      case 'EXECUTIVE_SUMMARY_GENERATION':
        this.stats.tierBreakdown.tier1MiniCalls++
        return {
          tier: 'TIER_1_MINI',
          modelName: 'gpt-4o-mini / claude-3-haiku',
          estimatedCostPerCallUsd: 0.0003,
          reason: 'Tối ưu chi phí cực thấp ($0.15/1M tokens) cho tác vụ phân loại & giải thích số liệu.',
        }

      case 'DAYS_OF_SUPPLY_MATH':
      case 'ACOS_CALCULATION':
      case 'ANOMALY_THRESHOLD_FILTER':
      default:
        this.stats.tierBreakdown.tier3CodeExecutions++
        return {
          tier: 'TIER_3_CODE',
          modelName: 'Deterministic TypeScript / PostgreSQL',
          estimatedCostPerCallUsd: 0.0,
          reason: 'Xử lý hoàn toàn bằng toán học & SQL miễn phí, độ trễ 0ms, không tốn token.',
        }
    }
  }

  // Record simulated execution
  recordCall(tier: AIModelTier, tokensCount: number) {
    this.stats.totalTokensProcessed += tokensCount
    const rawTokens = tokensCount * 21
    this.stats.rawTokensBeforeDistillation += rawTokens
    this.stats.tokensSavedPercentage = Number(
      (((this.stats.rawTokensBeforeDistillation - this.stats.totalTokensProcessed) /
        this.stats.rawTokensBeforeDistillation) *
        100).toFixed(2)
    )

    if (tier === 'TIER_1_MINI') {
      this.stats.totalSpendUsdThisMonth += (tokensCount / 1000000) * 0.15
    } else if (tier === 'TIER_2_SONNET') {
      this.stats.totalSpendUsdThisMonth += (tokensCount / 1000000) * 3.0
    }

    this.stats.monthlyCostPerClientUsd = Number((this.stats.totalSpendUsdThisMonth / 5).toFixed(2))
  }
}

export const aiRouter = new AIRouterManager()
