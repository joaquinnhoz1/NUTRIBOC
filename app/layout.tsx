import type { Metadata } from 'next'
import { Newsreader, Outfit } from 'next/font/google'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Nut. Brenda Coloccini — Nutrición & Bienestar | Nutri.bcg',
  description:
    'Nut. Brenda Coloccini, Licenciada en Nutrición. Acompañamiento nutricional cálido y profesional. Planes personalizados, consultas online y presenciales. Reservá tu turno.',
  openGraph: {
    title: 'Nut. Brenda Coloccini — Nutrición & Bienestar',
    description:
      'Acompañamiento nutricional cálido y profesional. Hábitos reales que se sostienen, sin dietas imposibles ni culpas.',
    type: 'website',
    locale: 'es_AR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${newsreader.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  )
}
