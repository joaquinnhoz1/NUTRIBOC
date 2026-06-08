import { BookingCalendar } from './BookingCalendar'
import { SectionReveal } from './SectionReveal'

export function Agenda() {
  return (
    <section className="section agenda" id="agenda">
      <div
        className="blob"
        style={{ width: 320, height: 320, background: '#E2E8D3', bottom: -100, left: '4%', opacity: 0.7 }}
      />
      <div className="wrap">
        <SectionReveal className="section-head">
          <span className="eyebrow">Agenda de turnos</span>
          <h2>Reservá tu <em>consulta</em></h2>
          <p>Elegí modalidad, día y horario. Pensado para una experiencia impecable, también desde el celular.</p>
        </SectionReveal>
        <BookingCalendar />
      </div>
    </section>
  )
}
