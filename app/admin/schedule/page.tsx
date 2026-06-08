import { prisma } from '@/lib/db'
import { getSetting } from '@/lib/settings'
import { BlockSlotManager } from '@/components/admin/BlockSlotManager'
import { BlockDayManager } from '@/components/admin/BlockDayManager'
import { SlotEditor } from '@/components/admin/SlotEditor'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
}

function parseSlots(raw: string, fallback: string[]): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return fallback
}

export default async function SchedulePage() {
  const [blockedSlots, blockedDays, rawPresencial, rawOnline] = await Promise.all([
    prisma.blockedSlot.findMany({ orderBy: { date: 'asc' } }),
    prisma.blockedDay.findMany({ orderBy: { date: 'asc' } }),
    getSetting('slots_presencial'),
    getSetting('slots_online'),
  ])

  const slotsPresencial = parseSlots(rawPresencial, ['09:00','10:00','11:00','12:00','15:00','16:00','17:00','18:00'])
  const slotsOnline = parseSlots(rawOnline, ['08:00','09:00','13:00','14:00','19:00','20:00'])

  return (
    <>
      <div className="adm-page-header">
        <h1>Horarios y bloqueos</h1>
        <p>Configurá los horarios disponibles y bloqueá turnos o días específicos</p>
      </div>

      <SlotEditor
        initialPresencial={slotsPresencial}
        initialOnline={slotsOnline}
      />

      <BlockDayManager
        blockedDays={blockedDays.map(d => ({ ...d, label: fmtDate(d.date) }))}
      />

      <BlockSlotManager
        blockedSlots={blockedSlots.map(s => ({ ...s, label: fmtDate(s.date) }))}
      />
    </>
  )
}
