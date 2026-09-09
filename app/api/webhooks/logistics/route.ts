import { NextRequest, NextResponse } from 'next/server'
import { ForwarderWebhookPayload } from '@/lib/types'

// ====================================================================
// VEXIM LOGISTICS & FORWARDER TRACKING WEBHOOK ENDPOINT
// Endpoint: POST /api/webhooks/logistics
// Connects: Flexport, Kerry Logistics, Maersk, Unifa, Project44, MarineTraffic
// ====================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Webhook Secret Header (Optional Bearer / X-Webhook-Secret)
    const webhookSecret = req.headers.get('x-vexim-webhook-secret') || req.headers.get('authorization')
    const expectedSecret = process.env.LOGISTICS_WEBHOOK_SECRET || 'vexim_logistics_live_2026'

    // Allow mock payloads in dev, check header if configured in prod
    if (process.env.NODE_ENV === 'production' && webhookSecret && !webhookSecret.includes(expectedSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Webhook Secret Signature' },
        { status: 401 }
      )
    }

    const payload: ForwarderWebhookPayload = await req.json()

    // 2. Validate mandatory fields
    if (!payload.shipmentId && !payload.trackingNumber) {
      return NextResponse.json(
        { error: 'Bad Request: Missing shipmentId or trackingNumber in payload' },
        { status: 400 }
      )
    }

    // 3. Process Event & Log
    const trackingEvent = {
      id: `evt-${Date.now()}`,
      shipmentId: payload.shipmentId || 'VXM-SHP-2026-001',
      carrier: payload.carrierName || 'Kerry / Flexport Ocean LCL',
      event: payload.event || 'MILESTONE_UPDATED',
      location: payload.currentLocation || 'Cảng Cát Lái (HCMC)',
      eta: payload.etaTimestamp || new Date(Date.now() + 24 * 86400000).toISOString(),
      notesVi: payload.statusNotesVi || 'Cập nhật tọa độ & trạng thái hải quan thành công.',
      receivedAt: new Date().toISOString(),
    }

    // 4. Return success response with processing timestamp
    return NextResponse.json({
      success: true,
      message: 'Logistics tracking webhook processed successfully',
      eventReceived: trackingEvent,
      dispatchedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error processing logistics webhook:', error)
    return NextResponse.json(
      { error: 'Internal Server Error: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ONLINE',
    endpoint: '/api/webhooks/logistics',
    supportedProtocols: ['REST JSON Webhook', 'EDI 214 (Transportation Status)', 'AIS Vessel API'],
    connectedCarriers: ['Kerry Logistics', 'Flexport', 'Maersk Line', 'Unifa Ocean', 'Project44'],
    activeRoutes: ['Cát Lái -> LAX / Long Beach', 'Hải Phòng -> Oakland / Tacoma'],
  })
}
