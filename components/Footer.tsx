import Image from 'next/image'
import { getSetting } from '@/lib/settings'

function formatPhoneDisplay(number: string) {
  const digits = number.replace(/\D/g, '')
  const local = digits.startsWith('54') ? digits.slice(2) : digits
  if (local.length === 10) return `${local.slice(0, 4)} ${local.slice(4)}`
  return local
}

export async function Footer() {
  const waNumber = await getSetting('whatsapp_number')
  const display = formatPhoneDisplay(waNumber)

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Image src="/nutriboc-white.png" alt="Nutri.bcg" height={48} width={66} style={{ height: 48, width: 'auto' }} />
            <p>
              NutriBCG Brenda Coloccini — Licenciada en Nutrición. MN 13985 · MP 8362.
              Acompañamiento nutricional profesional y cercano.
            </p>
          </div>
          <div className="foot-col">
            <h4>Navegación</h4>
            <a href="#agenda">Agenda de turnos</a>
            <a href="#pagos">Formas de pago</a>
            <a href="#agenda">Reservar turno</a>
          </div>
          <div className="foot-col">
            <h4>Contacto</h4>
            <a href={`https://wa.me/${waNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              WhatsApp {display}
            </a>
            <a href="#pagos">Formas de pago</a>
            <a href="#agenda">Reservar turno</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Brenda Coloccini · Nutri.bcg. Todos los derechos reservados.</span>
          <span>MN 13985 · MP 8362</span>
        </div>
      </div>
    </footer>
  )
}
