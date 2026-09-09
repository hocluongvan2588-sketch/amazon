import { FreightRateCard, LandedCostCalculationResult, InboundShipmentItem } from './types'

// ====================================================================
// VEXIM LOGISTICS & FREIGHT CALCULATION ENGINE
// International Trade (Incoterms 2020: FOB VN -> DDP/FBA US FC)
// ====================================================================

export const DEFAULT_RATE_CARDS: FreightRateCard[] = [
  {
    id: 'rate-catlai-lax-lcl',
    carrierPartnerName: 'Kerry / Flexport Ocean LCL',
    transportMode: 'OCEAN_LCL',
    originPort: 'Cát Lái (HCMC)',
    destinationPort: 'Los Angeles (LAX / LGB)',
    ratePerCbmUsd: 115,
    estimatedTransitDays: 24,
    customsClearanceDaysEst: 4,
    validUntil: '2026-12-31',
    fuelSurchargePercent: 8.5,
    documentationFeeUsd: 65,
    drayageEstUsd: 180,
  },
  {
    id: 'rate-catlai-lax-fcl40',
    carrierPartnerName: 'Maersk / ONE FCL 40HC Direct',
    transportMode: 'OCEAN_FCL_40HC',
    originPort: 'Cát Lái (HCMC)',
    destinationPort: 'Long Beach (LGB)',
    ratePerContainerUsd: 4850,
    estimatedTransitDays: 21,
    customsClearanceDaysEst: 3,
    validUntil: '2026-12-31',
    fuelSurchargePercent: 12.0,
    documentationFeeUsd: 95,
    drayageEstUsd: 450,
  },
  {
    id: 'rate-hph-lax-lcl',
    carrierPartnerName: 'Unifa / Expeditors Ocean LCL',
    transportMode: 'OCEAN_LCL',
    originPort: 'Hải Phòng (HPH)',
    destinationPort: 'Los Angeles (LAX)',
    ratePerCbmUsd: 125,
    estimatedTransitDays: 26,
    customsClearanceDaysEst: 4,
    validUntil: '2026-12-31',
    fuelSurchargePercent: 8.5,
    documentationFeeUsd: 65,
    drayageEstUsd: 180,
  },
  {
    id: 'rate-sng-air-express',
    carrierPartnerName: 'DHL Express / FedEx Priority',
    transportMode: 'AIR_EXPRESS',
    originPort: 'Tân Sơn Nhất (SGN)',
    destinationPort: 'Ontario Airport (ONT/LAX)',
    ratePerKgUsd: 7.20,
    estimatedTransitDays: 5,
    customsClearanceDaysEst: 1,
    validUntil: '2026-12-31',
    fuelSurchargePercent: 16.0,
    documentationFeeUsd: 35,
    drayageEstUsd: 0,
  },
]

/**
 * Tính toán thể tích CBM (Cubic Meters)
 * Công thức: (Dài cm * Rộng cm * Cao cm * Số thùng) / 1,000,000
 */
export function calculateCbm(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  cartonCount: number
): number {
  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0 || cartonCount <= 0) return 0
  const cbm = (lengthCm * widthCm * heightCm * cartonCount) / 1_000_000
  return Number(cbm.toFixed(3))
}

/**
 * Tính trọng lượng quy đổi thể tích (Volumetric / Dimensional Weight)
 * Đường hàng không IATA (Air Cargo / Express): D * R * C / 5000 (hoặc 6000)
 * Đường biển LCL: 1 CBM tương đương 1,000 kg (hoặc 1 CBM : 167 kg)
 */
export function calculateVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  cartonCount: number,
  divisor: number = 5000
): number {
  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0 || cartonCount <= 0) return 0
  const volWeight = (lengthCm * widthCm * heightCm * cartonCount) / divisor
  return Number(volWeight.toFixed(2))
}

/**
 * Tính toán Landed Cost tự động toàn diện theo chuẩn kế toán quản trị xuất khẩu US
 */
export function calculateFullLandedCost(params: {
  item: InboundShipmentItem
  rateCard: FreightRateCard
  tariffDutyPercent: number // e.g. 6.5% for general food/handicraft, 0% GSP/Free
  usCustomsProcessingFeeUsd?: number // MPF (0.3464%) min $31.67, max $614.35
  fbaPlacementOption: 'SPLIT_5_REGIONS' | 'SINGLE_DESTINATION' // Split = $0 fee, Single = $0.28/unit
  insuranceRatePercent?: number // e.g. 0.35% of CIF
}): LandedCostCalculationResult {
  const {
    item,
    rateCard,
    tariffDutyPercent,
    usCustomsProcessingFeeUsd = 45,
    fbaPlacementOption,
    insuranceRatePercent = 0.35,
  } = params

  const totalUnits = item.unitsPerCarton * item.cartonCount
  const grossWeightKg = Number((item.cartonWeightKg * item.cartonCount).toFixed(2))
  const totalCbm = calculateCbm(
    item.cartonDimensionsCm.length,
    item.cartonDimensionsCm.width,
    item.cartonDimensionsCm.height,
    item.cartonCount
  )

  const isAir = rateCard.transportMode.startsWith('AIR')
  const volumetricWeightKg = calculateVolumetricWeight(
    item.cartonDimensionsCm.length,
    item.cartonDimensionsCm.width,
    item.cartonDimensionsCm.height,
    item.cartonCount,
    isAir ? 5000 : 1000
  )

  // Chargeable weight is MAX of actual gross weight and volumetric weight
  const chargeableWeightKg = isAir
    ? Math.max(grossWeightKg, volumetricWeightKg)
    : totalCbm // for ocean LCL, charged by CBM

  // 1. Freight Cost
  let baseFreightUsd = 0
  if (rateCard.transportMode === 'OCEAN_FCL_40HC' || rateCard.transportMode === 'OCEAN_FCL_20FT') {
    baseFreightUsd = rateCard.ratePerContainerUsd || 4500
  } else if (rateCard.transportMode === 'OCEAN_LCL') {
    baseFreightUsd = Math.max(totalCbm * (rateCard.ratePerCbmUsd || 115), 115) // min 1 CBM
  } else {
    // Air
    baseFreightUsd = chargeableWeightKg * (rateCard.ratePerKgUsd || 7.2)
  }

  const fuelSurchargeUsd = (baseFreightUsd * (rateCard.fuelSurchargePercent || 0)) / 100
  const freightCostUsd = baseFreightUsd + fuelSurchargeUsd + rateCard.documentationFeeUsd

  // 2. Total FOB Cost of Goods
  const totalFobCostUsd = totalUnits * item.fobUnitCostUsd

  // 3. CIF Base for US Customs Duty (FOB + Freight + Insurance)
  const insuranceCostUsd = (totalFobCostUsd * insuranceRatePercent) / 100
  const cifValueUsd = totalFobCostUsd + freightCostUsd + insuranceCostUsd

  // 4. US Customs Tariff & Duty
  const importTariffDutyUsd = (totalFobCostUsd * tariffDutyPercent) / 100 // US calculates duty on FOB value

  // 5. Port Drayage & Clearance
  const customsAndDrayageUsd = rateCard.drayageEstUsd + usCustomsProcessingFeeUsd

  // 6. Amazon FBA Placement Fee
  const fbaPlacementFeePerUnit = fbaPlacementOption === 'SINGLE_DESTINATION' ? 0.28 : 0.0
  const fbaInboundPlacementFeeUsd = totalUnits * fbaPlacementFeePerUnit

  // 7. Total Landed Cost (DDP FBA Inbound)
  const totalLandedCostUsd =
    totalFobCostUsd +
    freightCostUsd +
    importTariffDutyUsd +
    customsAndDrayageUsd +
    insuranceCostUsd +
    fbaInboundPlacementFeeUsd

  // Per Unit Breakdown
  const finalLandedCostPerUnit = totalUnits > 0 ? totalLandedCostUsd / totalUnits : 0
  const freightCostPerUnit = totalUnits > 0 ? freightCostUsd / totalUnits : 0
  const dutyCostPerUnit = totalUnits > 0 ? importTariffDutyUsd / totalUnits : 0
  const fbaInboundFeePerUnit = fbaPlacementFeePerUnit
  const landedCostMultiplier = item.fobUnitCostUsd > 0 ? finalLandedCostPerUnit / item.fobUnitCostUsd : 1

  return {
    totalUnits,
    totalCartons: item.cartonCount,
    grossWeightKg,
    totalCbm,
    volumetricWeightKg,
    chargeableWeightKg,
    freightCostUsd: Number(freightCostUsd.toFixed(2)),
    importTariffDutyUsd: Number(importTariffDutyUsd.toFixed(2)),
    customsAndDrayageUsd: Number(customsAndDrayageUsd.toFixed(2)),
    fbaInboundPlacementFeeUsd: Number(fbaInboundPlacementFeeUsd.toFixed(2)),
    totalLandedCostUsd: Number(totalLandedCostUsd.toFixed(2)),
    fobCostPerUnit: Number(item.fobUnitCostUsd.toFixed(2)),
    freightCostPerUnit: Number(freightCostPerUnit.toFixed(2)),
    dutyCostPerUnit: Number(dutyCostPerUnit.toFixed(2)),
    fbaInboundFeePerUnit: Number(fbaInboundFeePerUnit.toFixed(2)),
    finalLandedCostPerUnit: Number(finalLandedCostPerUnit.toFixed(2)),
    landedCostMultiplier: Number(landedCostMultiplier.toFixed(2)),
  }
}
