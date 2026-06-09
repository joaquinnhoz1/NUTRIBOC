import { prisma } from './db'

export const SETTING_KEYS = [
  'whatsapp_number',
  'whatsapp_comprobante',
  'transfer_cbu',
  'transfer_alias',
  'transfer_titular',
  'transfer_banco',
  'consultation_fee',
  'consultation_fee_mp',
  'mp_link',
  'slots_presencial',
  'slots_online',
  'slots_presencial_0',
  'slots_presencial_1',
  'slots_presencial_2',
  'slots_presencial_3',
  'slots_presencial_4',
  'slots_presencial_5',
  'slots_presencial_6',
  'slots_online_0',
  'slots_online_1',
  'slots_online_2',
  'slots_online_3',
  'slots_online_4',
  'slots_online_5',
  'slots_online_6',
  'min_days_ahead',
  'booking_hold_minutes',
  'business_hours',
  'business_hours_detail',
  'stat_experience',
  'stat_patients',
] as const

export type SettingKey = typeof SETTING_KEYS[number]

const ENV_DEFAULTS: Record<string, string> = {
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '542314541335',
  whatsapp_comprobante: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '542314541335',
  transfer_cbu: process.env.NEXT_PUBLIC_TRANSFER_CBU || '',
  transfer_alias: process.env.NEXT_PUBLIC_TRANSFER_ALIAS || '',
  transfer_titular: process.env.NEXT_PUBLIC_TRANSFER_TITULAR || 'Brenda Coloccini',
  transfer_banco: process.env.NEXT_PUBLIC_TRANSFER_BANCO || '',
  consultation_fee: process.env.NEXT_PUBLIC_CONSULTATION_FEE || '5000',
  consultation_fee_mp: process.env.NEXT_PUBLIC_CONSULTATION_FEE || '5000',
  mp_link: '',
  slots_presencial: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_online: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  // per-day slots (0=Dom, 1=Lun, ..., 6=Sáb) — default to global slots
  slots_presencial_0: '[]',
  slots_presencial_1: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_presencial_2: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_presencial_3: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_presencial_4: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_presencial_5: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_presencial_6: '["09:00","10:00","11:00","12:00","15:00","16:00","17:00","18:00"]',
  slots_online_0: '[]',
  slots_online_1: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  slots_online_2: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  slots_online_3: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  slots_online_4: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  slots_online_5: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  slots_online_6: '["08:00","09:00","13:00","14:00","19:00","20:00"]',
  min_days_ahead: '1',
  booking_hold_minutes: '30',
  business_hours: 'Lun a Sáb · 09 a 20 hs',
  business_hours_detail: 'Online y presencial',
  stat_experience: '10',
  stat_patients: '800',
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany()
  const map: Record<string, string> = { ...ENV_DEFAULTS }
  for (const row of rows) {
    map[row.key] = row.value
  }
  return map
}

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } })
  return row?.value ?? ENV_DEFAULTS[key] ?? ''
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

export async function setSettings(data: Record<string, string>): Promise<void> {
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )
}

export async function getAdminPassword(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: 'admin_password' } })
  // No hardcoded fallback — ADMIN_PASSWORD must be set in env if DB has no value yet
  return row?.value ?? process.env.ADMIN_PASSWORD ?? ''
}
