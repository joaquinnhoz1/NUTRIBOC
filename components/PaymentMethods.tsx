import { SectionReveal } from './SectionReveal'

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function PaymentMethods() {
  return (
    <section className="section" id="pagos">
      <div className="wrap">
        <SectionReveal className="section-head">
          <span className="eyebrow">Formas de pago</span>
          <h2>Pagá como <em>prefieras</em></h2>
          <p>Dos opciones simples para confirmar tu reserva.</p>
        </SectionReveal>
        <div className="pay-grid">
          <SectionReveal className="pay" delay={0}>
            <span className="pay-badge">Sin recargos</span>
            <div className="opt">Opción A</div>
            <h3>Transferencia bancaria</h3>
            <p>Aboná por transferencia y confirmá tu turno enviando el comprobante por WhatsApp.</p>
            <ul>
              <li><CheckIcon /> Sin costos adicionales</li>
              <li><CheckIcon /> Acreditación inmediata</li>
              <li><CheckIcon /> Datos enviados al reservar</li>
            </ul>
          </SectionReveal>
          <SectionReveal className="pay" delay={70}>
            <span className="pay-badge">Tarjetas y billeteras</span>
            <div className="opt">Opción B</div>
            <h3>Mercado Pago</h3>
            <p>Para quienes prefieran tarjeta de débito, crédito o billeteras virtuales.</p>
            <ul>
              <li><CheckIcon /> Débito, crédito y billeteras</li>
              <li><CheckIcon /> Pago en cuotas disponible</li>
              <li><CheckIcon /> Link de pago al confirmar</li>
            </ul>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
