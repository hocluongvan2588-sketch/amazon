// ====================================================================
// VEXIM ANALYTICS & PRE-CALCULATION ENGINE (DETERMINISTIC CODE)
// 80% Math & Rule-based Filtering + 20% LLM Reasoning Architecture
// ====================================================================

import { InventoryItem, PpcCampaign, PpcKeyword, Product } from './types'

export interface AnomalyDetectionResult {
  hasAnomaly: boolean
  entityType: 'INVENTORY' | 'PPC_KEYWORD' | 'LISTING_CVR' | 'CUSTOMER_SAFETY'
  severity: 'CRITICAL' | 'HIGH' | 'OPPORTUNITY' | 'NORMAL'
  rawMetrics: Record<string, number | string>
  distilledPromptPayload: Record<string, any>
}

export class AnalyticsEngine {
  // 1. Seasonality & Velocity Pre-calculator (Math $0)
  static calculateSeasonalityAdjustedVelocity(
    velocity7d: number,
    velocity30d: number,
    currentMonth: number = new Date().getMonth() + 1
  ): {
    projectedDailyVelocity: number
    seasonalityMultiplier: number
    isPeakSeason: boolean
  } {
    // Q4 Peak Season (Oct - Dec): Factor 1.45 - 2.1x
    // Q1 Post-holiday (Jan - Feb): Factor 0.85x
    // Prime Day Season (July): Factor 1.35x
    let seasonalityMultiplier = 1.0
    let isPeakSeason = false

    if (currentMonth >= 10 && currentMonth <= 12) {
      seasonalityMultiplier = 1.65 // Q4 Holiday Surge
      isPeakSeason = true
    } else if (currentMonth === 7) {
      seasonalityMultiplier = 1.35 // Prime Day Month
      isPeakSeason = true
    } else if (currentMonth <= 2) {
      seasonalityMultiplier = 0.85 // Post-Holiday Dip
    }

    // Weighted Moving Velocity (7d 60% weight, 30d 40% weight)
    const baseWeightedVelocity = velocity7d * 0.6 + velocity30d * 0.4
    const projectedDailyVelocity = Number((baseWeightedVelocity * seasonalityMultiplier).toFixed(2))

    return {
      projectedDailyVelocity,
      seasonalityMultiplier,
      isPeakSeason,
    }
  }

  // 2. Fast Anomaly Filter for Inventory (Only triggers AI when breached)
  static detectInventoryAnomaly(item: InventoryItem): AnomalyDetectionResult {
    const { projectedDailyVelocity } = this.calculateSeasonalityAdjustedVelocity(
      item.dailyVelocity7d,
      item.dailyVelocity30d
    )

    const effectiveDaysOfSupply = item.fbaAvailable / (projectedDailyVelocity || 1)
    const leadTime = item.supplierLeadTimeDays || 32

    // Threshold 1: CRITICAL (< 45% of Lead Time)
    if (effectiveDaysOfSupply < leadTime * 0.45) {
      const shortageUnits = Math.round((leadTime * 1.5 - effectiveDaysOfSupply) * projectedDailyVelocity)
      const airExpressEmergency = Math.round(projectedDailyVelocity * 14)
      const seaUnits = Math.max(0, shortageUnits - airExpressEmergency)

      return {
        hasAnomaly: true,
        entityType: 'INVENTORY',
        severity: 'CRITICAL',
        rawMetrics: {
          fbaAvailable: item.fbaAvailable,
          daysOfSupply: Number(effectiveDaysOfSupply.toFixed(1)),
          leadTimeDays: leadTime,
        },
        // Distilled payload: Only 120 tokens instead of 5,000 raw SP-API tokens!
        distilledPromptPayload: {
          sku: item.sku,
          availableStock: item.fbaAvailable,
          dailySales: projectedDailyVelocity,
          daysLeft: Number(effectiveDaysOfSupply.toFixed(1)),
          leadTimeDays: leadTime,
          suggestedSeaUnits: seaUnits,
          suggestedAirUnits: airExpressEmergency,
          totalReorderUnits: shortageUnits,
          unitCost: item.unitCostUsd,
        },
      }
    }

    // Threshold 2: HIGH (Between 45% and 65% of Lead Time)
    if (effectiveDaysOfSupply < leadTime * 0.65) {
      return {
        hasAnomaly: true,
        entityType: 'INVENTORY',
        severity: 'HIGH',
        rawMetrics: {
          fbaAvailable: item.fbaAvailable,
          daysOfSupply: Number(effectiveDaysOfSupply.toFixed(1)),
          leadTimeDays: leadTime,
        },
        distilledPromptPayload: {
          sku: item.sku,
          availableStock: item.fbaAvailable,
          dailySales: projectedDailyVelocity,
          daysLeft: Number(effectiveDaysOfSupply.toFixed(1)),
          leadTimeDays: leadTime,
        },
      }
    }

    return {
      hasAnomaly: false,
      entityType: 'INVENTORY',
      severity: 'NORMAL',
      rawMetrics: { daysOfSupply: Number(effectiveDaysOfSupply.toFixed(1)) },
      distilledPromptPayload: {},
    }
  }

  // 3. Fast Anomaly Filter for PPC Keywords (Code $0)
  static detectPpcAnomaly(kw: PpcKeyword, targetAcos: number = 25.0): AnomalyDetectionResult {
    // Bleeding keyword: spend > $20, clicks >= 10, ACOS > target * 1.6
    if (kw.spend >= 20 && kw.clicks >= 10 && kw.acos > targetAcos * 1.6) {
      const suggestedCutBid = Math.max(0.25, Number((kw.bid * 0.65).toFixed(2)))
      return {
        hasAnomaly: true,
        entityType: 'PPC_KEYWORD',
        severity: 'HIGH',
        rawMetrics: { acos: kw.acos, spend: kw.spend, targetAcos },
        distilledPromptPayload: {
          keyword: kw.keywordText,
          matchType: kw.matchType,
          currentBid: kw.bid,
          suggestedBid: suggestedCutBid,
          acos: kw.acos,
          targetAcos,
          spend7d: kw.spend,
          sales7d: kw.sales,
          action: 'CUT_BID_AND_NEGATIVE_PHRASE',
        },
      }
    }

    // Scaling opportunity: ACOS < target * 0.8, CVR > 20%, orders >= 5
    if (kw.orders >= 5 && kw.acos < targetAcos * 0.8 && kw.conversionRate >= 20) {
      const suggestedScaleBid = Number((kw.bid * 1.15).toFixed(2))
      return {
        hasAnomaly: true,
        entityType: 'PPC_KEYWORD',
        severity: 'OPPORTUNITY',
        rawMetrics: { acos: kw.acos, cvr: kw.conversionRate, orders: kw.orders },
        distilledPromptPayload: {
          keyword: kw.keywordText,
          matchType: kw.matchType,
          currentBid: kw.bid,
          suggestedBid: suggestedScaleBid,
          acos: kw.acos,
          cvr: kw.conversionRate,
          orders: kw.orders,
          action: 'SCALE_TOP_OF_SEARCH',
        },
      }
    }

    return {
      hasAnomaly: false,
      entityType: 'PPC_KEYWORD',
      severity: 'NORMAL',
      rawMetrics: {},
      distilledPromptPayload: {},
    }
  }

  // 4. Causal Decomposition Engine (Decomposes Revenue Variance by Exact Math)
  static decomposeRevenueVariance(
    current: { revenue: number; sessions: number; cvr: number; aov: number },
    previous: { revenue: number; sessions: number; cvr: number; aov: number }
  ): {
    trafficImpactDollar: number
    conversionImpactDollar: number
    priceImpactDollar: number
    primaryDriver: 'TRAFFIC_GROWTH' | 'CVR_IMPROVEMENT' | 'PRICE_CHANGE' | 'CVR_DROP' | 'TRAFFIC_DROP'
    explanationVi: string
  } {
    // Mathematical exact variance attribution:
    // deltaRevenue = deltaSessions * prevCVR * prevAOV + prevSessions * deltaCVR * prevAOV + ...
    const deltaSessions = current.sessions - previous.sessions
    const deltaCvr = (current.cvr - previous.cvr) / 100
    const deltaAov = current.aov - previous.aov

    const trafficImpact = deltaSessions * (previous.cvr / 100) * previous.aov
    const conversionImpact = current.sessions * deltaCvr * previous.aov
    const priceImpact = current.sessions * (current.cvr / 100) * deltaAov

    let primaryDriver: any = 'TRAFFIC_GROWTH'
    let explanationVi = ''

    if (Math.abs(conversionImpact) > Math.abs(trafficImpact)) {
      if (conversionImpact > 0) {
        primaryDriver = 'CVR_IMPROVEMENT'
        explanationVi = `Tỷ lệ chuyển đổi cải thiện (+${(deltaCvr * 100).toFixed(1)}% pts) đóng góp chính (+${Math.round(conversionImpact).toLocaleString()} USD) vào tăng trưởng doanh thu.`
      } else {
        primaryDriver = 'CVR_DROP'
        explanationVi = `Tỷ lệ chuyển đổi suy giảm (${(deltaCvr * 100).toFixed(1)}% pts) làm thất thoát ước tính ~${Math.abs(Math.round(conversionImpact)).toLocaleString()} USD doanh thu.`
      }
    } else {
      if (trafficImpact > 0) {
        primaryDriver = 'TRAFFIC_GROWTH'
        explanationVi = `Lượng truy cập tăng (+${deltaSessions} sessions) đóng góp chính (+${Math.round(trafficImpact).toLocaleString()} USD) vào tăng trưởng.`
      } else {
        primaryDriver = 'TRAFFIC_DROP'
        explanationVi = `Lượng truy cập suy giảm (${deltaSessions} sessions) là nguyên nhân chính kéo tụt doanh thu.`
      }
    }

    return {
      trafficImpactDollar: Math.round(trafficImpact),
      conversionImpactDollar: Math.round(conversionImpact),
      priceImpactDollar: Math.round(priceImpact),
      primaryDriver,
      explanationVi,
    }
  }
}
