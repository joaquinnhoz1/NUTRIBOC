export const dynamic = 'force-dynamic'

import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { Agenda } from '@/components/Agenda'
import { PaymentMethods } from '@/components/PaymentMethods'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { WhatsAppFAB } from '@/components/WhatsAppFAB'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Agenda />
        <PaymentMethods />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  )
}
