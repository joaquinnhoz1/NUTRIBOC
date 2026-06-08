import { SectionReveal } from './SectionReveal'

const STEPS = [
  { n: '1', title: 'Elegís tu turno', desc: 'El día y horario que mejor se adapte a tu agenda.' },
  { n: '2', title: 'Reservás online', desc: 'Confirmás la modalidad presencial u online.' },
  { n: '3', title: 'Pagás la reserva', desc: 'Por transferencia o Mercado Pago, de forma segura.' },
  { n: '4', title: 'Confirmación', desc: 'Recibís la confirmación automática al instante.' },
]

export function HowItWorks() {
  return (
    <section className="section how" id="como">
      <div className="blob" style={{ width: 400, height: 400, background: 'rgba(255,255,255,.06)', top: -100, left: -80 }} />
      <div className="wrap">
        <SectionReveal className="section-head">
          <span className="eyebrow">Cómo funciona</span>
          <h2>Reservar es <em>simple</em></h2>
          <p>Cuatro pasos para empezar a cuidarte con acompañamiento profesional.</p>
        </SectionReveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <SectionReveal key={s.n} className="step" delay={i % 4 * 70}>
              <div className="circ">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
