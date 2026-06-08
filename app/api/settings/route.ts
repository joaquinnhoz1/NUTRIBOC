import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

// Public endpoint — only exposes non-sensitive settings needed by the booking form
export async function GET() {
  const all = await getSettings()
  return NextResponse.json({
    whatsapp_comprobante: all.whatsapp_comprobante,
    transfer_cbu: all.transfer_cbu,
    transfer_alias: all.transfer_alias,
    transfer_titular: all.transfer_titular,
    transfer_banco: all.transfer_banco,
    consultation_fee: all.consultation_fee,
    consultation_fee_mp: all.consultation_fee_mp,
    mp_link: all.mp_link,
    min_days_ahead: all.min_days_ahead,
  })
}
