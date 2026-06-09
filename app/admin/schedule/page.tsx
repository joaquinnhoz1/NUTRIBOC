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

function parseSlots(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return []
}

export default async function SchedulePage() {
  const [blockedSlots, blockedDays, ...rawSlots] = await Promise.all([
    prisma.blockedSlot.findMany({ orderBy: { date: 'asc' } }),
    prisma.blockedDay.findMany({ orderBy: { date: 'asc' } }),
    ...([0,1,2,3,4,5,6].map(d => getSetting(`slots_presencial_${d}`))),
    ...([0,1,2,3,4,5,6].map(d => getSetting(`slots_online_${d}`))),
  ])

  const presencialByDay = Object.fromEntries(
    [0,1,2,3,4,5,6].map((d, i) => [d, parseSlots(rawSlots[i] as string)])
  ) as Record<number, string[]>

  const onlineByDay = Object.fromEntries(
    [0,1,2,3,4,5,6].map((d, i) => [d, parseSlots(rawSlots[7 + i] as string)])
  ) as Record<number, string[]>

  return (
    <>
      <div className="adm-page-header">
        <h1>Horarios y bloqueos</h1>
        <p>Configurá los horarios disponibles y bloqueá turnos o días específicos</p>
      </div>

      <SlotEditor
        initialPresencial={presencialByDay}
        initialOnline={onlineByDay}
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
