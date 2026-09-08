'use client'

import React, { useState, useRef } from 'react'
import {
  Printer,
  Download,
  CheckCircle2,
  Package,
  Layers,
  FileText,
  X,
  Sparkles,
  QrCode,
  Sliders,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react'
import { Product } from '@/lib/types'

interface BarcodeAndLabelPrintModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  allProducts: Product[]
}

export function BarcodeAndLabelPrintModal({
  isOpen,
  onClose,
  product: initialProduct,
  allProducts,
}: BarcodeAndLabelPrintModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || allProducts[0]?.id || ''
  )
  const [labelType, setLabelType] = useState<'fnsku' | 'box_label'>('fnsku')
  const [printLayout, setPrintLayout] = useState<'a4_30up' | 'thermal_roll' | 'box_4x6'>('thermal_roll')
  const [quantity, setQuantity] = useState<number>(100)
  const [unitsPerBox, setUnitsPerBox] = useState<number>(30)
  const [boxCount, setBoxCount] = useState<number>(10)
  const [fbaShipmentId, setFbaShipmentId] = useState<string>('FBA18VEXIM0902')
  const [destinationFc, setDestinationFc] = useState<string>('ONT8 - Moreno Valley, CA 92551')

  const printableRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const selectedProduct = allProducts.find((p) => p.id === selectedProductId) || allProducts[0]

  const handlePrint = () => {
    window.print()
  }

  // Generate SVG Code-128 Mock Barcode lines
  const generateBarcodeLines = (seed: string) => {
    const chars = (seed || 'X00389102A').split('')
    return chars.map((char, index) => {
      const code = char.charCodeAt(0)
      const isThick = code % 2 === 0
      const isExtraThick = code % 3 === 0
      const width = isExtraThick ? 4 : isThick ? 2.5 : 1.2
      const gap = (code % 4) + 1.5
      return { width, gap, key: index }
    })
  }

  const barcodeLines = generateBarcodeLines(selectedProduct?.fnsku || 'X00389102A')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      {/* Print-specific style tag */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #amazon-printable-area, #amazon-printable-area * {
            visibility: visible;
          }
          #amazon-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Printer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  FBA PACKAGING ENGINE
                </span>
                <span className="text-xs text-slate-400">Amazon SP-API Compatible</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Bộ Xuất & In Tem Nhãn FNSKU & Box Labels Chuẩn Amazon US
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Two Columns (Controls & Live Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-6 gap-6">
          {/* LEFT: Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Select Product */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                1. Chọn Sản phẩm Xuất Xưởng
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-xs focus:border-cyan-500 focus:outline-hidden"
              >
                {allProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    [{prod.brand}] {prod.title.substring(0, 45)}... ({prod.fnsku})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Label Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Loại Tem Nhãn Cần In
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLabelType('fnsku')
                    setPrintLayout('thermal_roll')
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                    labelType === 'fnsku'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode size={18} className={labelType === 'fnsku' ? 'text-cyan-600' : 'text-slate-400'} />
                  <span className="text-xs">Tem FNSKU Barcode</span>
                  <span className="text-[10px] text-slate-400">Dán lên từng hộp sp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLabelType('box_label')
                    setPrintLayout('box_4x6')
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                    labelType === 'box_label'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Package size={18} className={labelType === 'box_label' ? 'text-cyan-600' : 'text-slate-400'} />
                  <span className="text-xs">Tem Thùng FBA Box ID</span>
                  <span className="text-[10px] text-slate-400">Dán lên thùng carton lớn</span>
                </button>
              </div>
            </div>

            {/* 3. Paper / Printer Layout */}
            {labelType === 'fnsku' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Định Dạng Máy In
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintLayout('thermal_roll')}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      printLayout === 'thermal_roll'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>Cuộn In Nhiệt (Thermal)</div>
                    <div className="text-[10px] font-normal text-slate-500">50 x 30 mm (Chuẩn Xưởng)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintLayout('a4_30up')}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      printLayout === 'a4_30up'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>Giấy A4 (30-up)</div>
                    <div className="text-[10px] font-normal text-slate-500">Chuẩn Avery 5160</div>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Quy Cách Thùng Carton
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Số sp / Thùng (Units/Box)</span>
                    <input
                      type="number"
                      value={unitsPerBox}
                      onChange={(e) => setUnitsPerBox(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Tổng số Thùng (Boxes)</span>
                    <input
                      type="number"
                      value={boxCount}
                      onChange={(e) => setBoxCount(Number(e.target.value))}
                      className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Shipment Parameters */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Thông số Lô Hàng Xuất Khẩu</span>
                <span className="text-[10px] text-emerald-600 font-mono bg-emerald-100 px-1.5 py-0.5 rounded">
                  Ready to Print
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã FNSKU:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedProduct?.fnsku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã ASIN:</span>
                  <span className="font-mono text-slate-900">{selectedProduct?.asin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã UPC Gốc (GS1):</span>
                  <span className="font-mono text-slate-900">{selectedProduct?.upc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kho đến (FC Destination):</span>
                  <span className="font-mono text-slate-900">{destinationFc.split(' - ')[0]}</span>
                </div>
              </div>
            </div>

            {/* Print & Download Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 transition-all active:scale-[0.99]"
              >
                <Printer size={16} />
                <span>Xuất File PDF & Ra Lệnh In Chuẩn 300 DPI</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Tương thích mọi máy in nhiệt Zebra, Xprinter, HPRT, Brother và máy in laser A4.
              </p>
            </div>
          </div>

          {/* RIGHT: Live Barcode Preview (7 cols) */}
          <div className="lg:col-span-7 bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-600" />
                Bản Xem Trước Thực Tế (Live Label Preview)
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                100% Amazon TOS Compliant
              </span>
            </div>

            {/* PRINTABLE CONTAINER (Captured during print) */}
            <div id="amazon-printable-area" ref={printableRef} className="w-full flex justify-center">
              {labelType === 'fnsku' ? (
                /* FNSKU ITEM LABEL PREVIEW */
                <div className="w-[340px] bg-white border-2 border-slate-900 rounded-lg p-3 shadow-md text-slate-900 flex flex-col items-center justify-between space-y-2">
                  {/* Mock Barcode Graphic */}
                  <div className="w-full flex justify-center items-end h-16 px-4 bg-white">
                    <div className="flex items-end gap-[2px] h-12 w-full justify-center">
                      {barcodeLines.map((line) => (
                        <div
                          key={line.key}
                          style={{ width: `${line.width}px` }}
                          className="h-full bg-black shrink-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* FNSKU String */}
                  <div className="font-mono font-extrabold text-sm tracking-wider text-black">
                    {selectedProduct?.fnsku}
                  </div>

                  {/* Product Title */}
                  <div className="text-[10px] leading-tight text-center font-medium text-slate-800 line-clamp-2 px-2">
                    {selectedProduct?.title}
                  </div>

                  {/* Condition & Made in Vietnam */}
                  <div className="w-full flex items-center justify-between text-[9px] font-bold border-t border-slate-300 pt-1.5 px-1 uppercase tracking-tight text-slate-700">
                    <span>Condition: New</span>
                    <span className="text-blue-900 font-extrabold">Made in Vietnam</span>
                  </div>
                </div>
              ) : (
                /* FBA BOX SHIPPING LABEL PREVIEW (4x6 inch) */
                <div className="w-[340px] bg-white border-2 border-slate-900 rounded-lg p-4 shadow-md text-slate-900 flex flex-col space-y-3">
                  {/* Top Bar: Ship From & Ship To */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] border-b-2 border-slate-900 pb-2">
                    <div>
                      <div className="font-bold uppercase text-slate-500">SHIP FROM:</div>
                      <div className="font-bold text-slate-900">{selectedProduct?.brand} Vietnam Factory</div>
                      <div className="text-slate-600">Industrial Zone, Ben Tre, VN</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase text-slate-500">SHIP TO:</div>
                      <div className="font-bold text-slate-900">AMAZON FULFILLMENT CENTER</div>
                      <div className="text-slate-600">{destinationFc}</div>
                    </div>
                  </div>

                  {/* Box Number & Qty */}
                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-300 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Box Contents:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {unitsPerBox} Units / Single-SKU
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">Box Number:</span>
                      <span className="font-mono font-black text-sm text-slate-900">BOX 1 OF {boxCount}</span>
                    </div>
                  </div>

                  {/* FBA Shipment Barcode */}
                  <div className="flex flex-col items-center justify-center pt-1">
                    <div className="flex items-end gap-[2px] h-10 w-full justify-center">
                      {barcodeLines.map((line) => (
                        <div
                          key={`box-${line.key}`}
                          style={{ width: `${line.width * 1.2}px` }}
                          className="h-full bg-black shrink-0"
                        />
                      ))}
                    </div>
                    <div className="font-mono font-bold text-xs tracking-wider mt-1">
                      {fbaShipmentId}U001
                    </div>
                  </div>

                  {/* Bottom details */}
                  <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-center text-[9px] font-mono">
                    <span>SKU: {selectedProduct?.sku}</span>
                    <span className="font-bold text-rose-700">HEAVY: NO (42.5 LBS)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Checklist */}
            <div className="w-full mt-4 bg-white/90 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info size={13} className="text-cyan-600" />
                Hướng dẫn dán nhãn xưởng tại Việt Nam:
              </div>
              <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                <li>Tem FNSKU phải dán đè hoàn toàn lên mã vạch UPC gốc.</li>
                <li>Mặt tem phải phẳng, không dán qua góc cạnh hoặc chỗ gập hộp.</li>
                <li>Tem thùng Carton dán ở 2 mặt hông đối diện nhau để robot quét dễ dàng.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Mã vạch chuẩn Code-128 tương thích 100% hệ thống quét kho Amazon FBA.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
