import { BookingCalendar } from './BookingCalendar'
import { SectionReveal } from './SectionReveal'

export function Agenda() {
  return (
    <section className="section agenda" id="agenda">
      <div className="wrap">
        <SectionReveal className="section-head">
          <h2>Reservá tu consulta</h2>
          <p>Elegí modalidad, día y horario. Domingos sin atención.</p>
        </SectionReveal>
        <BookingCalendar />
      </div>
    </section>
  )
}
