import { SectionReveal } from './SectionReveal'

const STEPS = [
  { n: '01', title: 'Elegís tu turno', desc: 'Seleccioná el día y horario que mejor se adapte a tu agenda.' },
  { n: '02', title: 'Reservás online', desc: 'Confirmás la modalidad: presencial u online, en pocos clics.' },
  { n: '03', title: 'Pagás la reserva', desc: 'Por transferencia o Mercado Pago, de forma segura.' },
  { n: '04', title: 'Recibís confirmación', desc: 'Te llega la confirmación automática con todos los detalles.' },
]

export function HowItWorks() {
  return (
    <section className="section how" id="como">
      <div className="wrap">
        <SectionReveal className="section-head">
          <span className="eyebrow">Cómo funciona</span>
          <h2>Reservar es simple</h2>
          <p>Cuatro pasos para empezar a cuidarse con acompañamiento profesional.</p>
        </SectionReveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <SectionReveal key={s.n} className="step" delay={i * 70}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
