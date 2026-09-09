import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabase-service'
import {
  capacityBidSuggestion,
  forecastDaysOfSupply,
  inchesToCubicFeet,
  seasonalityMultiplier,
} from '@/lib/forecast-engine'
import { mockInventory, mockProducts } from '@/lib/mock-data'
import type { InventoryItem, Product } from '@/lib/types'

// ====================================================================
// VEXIM INVENTORY FORECAST API — GET/POST /api/inventory/forecast (Sprint 3.3)
// 1) Days of Supply THỜI GIAN THỰC theo velocity trọng số 50/30/20 (7/14/30d)
// 2) Capacity Bid Suggestion: ft³ cần mua thêm cho đỉnh Q4 + mức $/ft³ tối ưu
// Dữ liệu: Supabase (DATABASE_LIVE) -> fallback mock (gắn cờ dataSource).
// ====================================================================

export async function GET(req: NextRequest) {
  return handler(req)
}
export async function POST(req: NextRequest) {
  return handler(req)
}

async function handler(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      targetCoverageDays?: number
      safetyFactor?: number
    }

    // 1. Nguồn dữ liệu: DB trước, mock fallback (minh bạch qua dataSource)
    let inventory: InventoryItem[]
    let products: Product[]
    let dataSource: 'DATABASE_LIVE' | 'SIMULATED_MOCK'
    try {
      const [dbInv, dbProds] = await Promise.all([
        SupabaseDatabaseService.getInventory(),
        SupabaseDatabaseService.getProducts(),
      ])
      if (dbInv && dbInv.length > 0) {
        inventory = dbInv
        products = dbProds && dbProds.length > 0 ? dbProds : mockProducts
        dataSource = 'DATABASE_LIVE'
      } else {
        inventory = mockInventory
        products = mockProducts
        dataSource = 'SIMULATED_MOCK'
      }
    } catch {
      inventory = mockInventory
      products = mockProducts
      dataSource = 'SIMULATED_MOCK'
    }

    const prodBySku = new Map(products.map((p) => [p.sku, p]))
    const season = seasonalityMultiplier(new Date().getMonth() + 1)

    // 2. Forecast từng SKU
    const forecasts = inventory.map((item) => {
      const v7 = item.dailyVelocity7d
      const v30 = item.dailyVelocity30d
      const v14 = (item as any).dailyVelocity14d as number | undefined

      const dos = forecastDaysOfSupply({
        fbaAvailable: item.fbaAvailable,
        fbaInbound: item.fbaInbound,
        velocity7d: v7,
        velocity14d: v14,
        velocity30d: v30,
      })

      // Capacity suggestion theo SKU (chuẩn hoá về STANDARD_SIZE)
      const prod = prodBySku.get(item.sku)
      const dims = prod?.dimensionsInches
      const ft3PerUnit = dims
        ? inchesToCubicFeet(dims.length, dims.width, dims.height)
        : 0.05

      const suggestion = capacityBidSuggestion({
        baseVelocity: dos.weightedVelocity,
        peakMultiplier: 1.65, // chuẩn bị cho đỉnh Q4 bất kể tháng hiện tại
        targetCoverageDays: body.targetCoverageDays,
        safetyFactor: body.safetyFactor,
        cubicFeetPerUnit: ft3PerUnit,
        // Hạn ngạch phân bổ ~ theo quy mô SKU (mock field tương đương khi LIVE
        // sẽ đọc từ bảng fba_capacity_usages) — dùng tỉ lệ 30 ngày bán được
        monthlyLimitCubicFeet: Math.max(
          50,
          Math.ceil(dos.baseVelocity * 30 * ft3PerUnit * 1.3)
        ),
        currentUsageCubicFeet: Math.ceil(dos.baseVelocity * 30 * ft3PerUnit * (item.riskLevel === 'HEALTHY' ? 1.05 : 1.2)),
        priceUsd: prod?.price ?? 20,
        unitCostUsd: prod?.cogs ?? item.unitCostUsd,
        fbaFeeUsd: prod?.fbaFeeEstimated ?? 4.5,
        referralFeeUsd: prod?.referralFeeEstimated ?? 3,
        storageType: 'STANDARD_SIZE',
      })

      return {
        sku: item.sku,
        asin: item.asin,
        title: item.title,
        clientId: item.clientId,
        fbaAvailable: item.fbaAvailable,
        fbaInbound: item.fbaInbound,
        velocities: {
          v7: v7,
          v14: dos.velocity14dUsed,
          v30: v30,
          v14IsFallback: dos.usedFallback14d,
          weighted: dos.weightedVelocity,
        },
        daysOfSupply: dos.daysOfSupply,
        daysOfSupplyWithInbound: dos.daysOfSupplyWithInbound,
        projectedPeakVelocity: dos.projectedPeakVelocity,
        estimatedStockoutDate: dos.estimatedStockoutDate,
        riskLevel: dos.riskLevel,
        formula: dos.formula,
        capacitySuggestion: suggestion,
      }
    })

    // 3. Tổng hợp bid suggestion theo storage type (gộp mọi SKU)
    const totalExtraFt3 = forecasts.reduce((s, f) => s + f.capacitySuggestion.extraCubicFeetToBuy, 0)
    const weightedBid =
      totalExtraFt3 > 0
        ? forecasts.reduce(
            (s, f) => s + f.capacitySuggestion.suggestedBidPerCubicFeet * f.capacitySuggestion.extraCubicFeetToBuy,
            0
          ) / totalExtraFt3
        : 0

    return NextResponse.json({
      dataSource,
      currentSeason: season,
      generatedAt: new Date().toISOString(),
      config: {
        targetCoverageDays: body.targetCoverageDays ?? 45,
        safetyFactor: body.safetyFactor ?? 1.15,
      },
      forecasts,
      consolidatedBid: {
        storageType: 'STANDARD_SIZE' as const,
        extraCubicFeetToBuy: totalExtraFt3,
        suggestedBidPerCubicFeet: Number(weightedBid.toFixed(2)),
        estimatedReservationFeeUsd: Number(
          forecasts.reduce((s, f) => s + f.capacitySuggestion.estimatedReservationFeeUsd, 0).toFixed(2)
        ),
      },
    })
  } catch (err: any) {
    console.error('[InventoryForecast API]', err)
    return NextResponse.json({ error: err?.message || 'Lỗi dự báo' }, { status: 500 })
  }
}
