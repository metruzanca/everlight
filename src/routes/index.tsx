import { createFileRoute } from '@tanstack/solid-router'
import { SiteHeader } from '../components/landing/site-header'
import { Hero } from '../components/landing/hero'
import { Logos } from '../components/landing/logos'
import { Features } from '../components/landing/features'
import { HowItWorks } from '../components/landing/how-it-works'
import { Stats } from '../components/landing/stats'
import { Faq } from '../components/landing/faq'
import { Cta } from '../components/landing/cta'
import { SiteFooter } from '../components/landing/site-footer'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div class="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Logos />
        <Features />
        <HowItWorks />
        <Stats />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  )
}
