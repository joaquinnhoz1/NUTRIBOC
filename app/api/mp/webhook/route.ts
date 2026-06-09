import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/db'
import { getPayment } from '@/lib/mercadopago'

// ── State machine ────────────────────────────────────────────────────────────
// Transitions allowed from each status.
// 'confirmed' is a terminal state — nothing can move it backwards.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:           ['pending_mp', 'confirmed', 'cancelled'],
  pending_mp:        ['confirmed', 'cancelled'],
  pending_transfer:  ['confirmed', 'cancelled'],
  cancelled:         [],      // terminal
  confirmed:         [],      // terminal — never regress
}

function resolveNewStatus(mpStatus: string, current: string): string | null {
  let target: string | null = null
  if (mpStatus === 'approved')                         target = 'confirmed'
  else if (mpStatus === 'pending')                     target = 'pending_mp'
  else if (mpStatus === 'rejected' || mpStatus === 'cancelled') target = 'cancelled'

  if (!target) return null
  if (target === current) return null  // no-op

  const allowed = ALLOWED_TRANSITIONS[current] ?? []
  if (!allowed.includes(target)) return null  // transition not allowed

  return target
}

// ── Signature validation ─────────────────────────────────────────────────────
// MP sends: x-signature: ts=<ts>,v1=<hmac>
// Signed string: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
// Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
function validateSignature(req: NextRequest, dataId: string): boolean {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET
  if (!webhookSecret) {
    // Not configured — skip validation but warn
    console.warn('[mp/webhook] MP_WEBHOOK_SECRET not set — skipping signature validation')
    return true
  }

  const xSignature  = req.headers.get('x-signature') ?? ''
  const xRequestId  = req.headers.get('x-request-id') ?? ''

  const tsMatch = xSignature.match(/ts=(\d+)/)
  const v1Match = xSignature.match(/v1=([a-f0-9]+)/)
  if (!tsMatch || !v1Match) {
    console.warn('[mp/webhook] Missing or malformed x-signature header')
    return false
  }

  const ts       = tsMatch[1]
  const received = v1Match[1]
  const payload  = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', webhookSecret).update(payload).digest('hex')

  if (received !== expected) {
    console.warn('[mp/webhook] Signature mismatch — possible forged webhook')
    return false
  }

  return true
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const type   = (body.type || body.topic) as string | undefined
  const dataId = (body.data as Record<string, unknown>)?.id ?? body.id

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ ok: true })
  }

  const dataIdStr = String(dataId)

  if (!validateSignature(req, dataIdStr)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const payment = await getPayment(dataIdStr)
    if (!payment) return NextResponse.json({ ok: true })

    const bookingId = payment.external_reference as string | undefined
    const mpStatus  = payment.status as string | undefined

    if (!bookingId || !mpStatus) return NextResponse.json({ ok: true })

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ ok: true })

    const newStatus = resolveNewStatus(mpStatus, booking.status)
    if (!newStatus) {
      // No valid transition — log and ack without updating
      console.info(`[mp/webhook] No transition: booking ${bookingId} ${booking.status} → mpStatus=${mpStatus}`)
      return NextResponse.json({ ok: true })
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status:      newStatus,
        mpPaymentId: dataIdStr,
        ...(newStatus === 'confirmed' && { expiresAt: null }),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[mp/webhook] Error processing payment:', err)
    // Return 500 so MP retries the webhook
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// MP sends GET to verify the endpoint is reachable
export async function GET() {
  return NextResponse.json({ ok: true })
}
