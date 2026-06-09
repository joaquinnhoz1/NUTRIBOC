import Image from 'next/image'
import { getSetting } from '@/lib/settings'

export async function Hero() {
  const [statExp, statPat] = await Promise.all([
    getSetting('stat_experience'),
    getSetting('stat_patients'),
  ])

  return (
    <section className="hero" id="inicio">
      <div className="wrap hero-inner">
        <div className="hero-text">
          <span className="eyebrow">Licenciada en Nutrición</span>
          <h1>NutriBCG Brenda<br />Coloccini</h1>
          <div className="hero-badges">
            <span className="badge">MN 13985</span>
            <span className="badge">MP 8362</span>
          </div>
          <p className="hero-lead">
            Acompañamiento nutricional serio y cercano. Planes reales, adaptados a su vida, para construir hábitos que se sostienen en el tiempo.
          </p>
          <div className="hero-actions">
            <a href="#agenda" className="btn btn-primary">Reservar turno</a>
            <a href="#como" className="btn btn-ghost">Cómo funciona</a>
          </div>
          <hr className="hero-divider" />
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>+{statExp}</strong>
              <span>años de experiencia</span>
            </div>
            <div className="hero-stat">
              <strong>+{statPat}</strong>
              <span>pacientes acompañados</span>
            </div>
            <div className="hero-stat">
              <strong>100%</strong>
              <span>planes personalizados</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-arch">
            <Image
              src="/nutriboc-black.png"
              alt="Nutri.bcg"
              width={340}
              height={340}
              className="hero-arch-img"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
