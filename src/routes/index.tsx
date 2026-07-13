import { createFileRoute } from '@tanstack/solid-router'
import { authClient } from '../lib/auth-client'
import { SiteHeader } from '../components/landing/site-header'
import { Hero } from '../components/landing/hero'
import { Logos } from '../components/landing/logos'
import { Features } from '../components/landing/features'
import { HowItWorks } from '../components/landing/how-it-works'
import { Stats } from '../components/landing/stats'
import { Comparison } from '../components/landing/comparison'
import { Faq } from '../components/landing/faq'
import { Cta } from '../components/landing/cta'
import { SiteFooter } from '../components/landing/site-footer'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const session = authClient.useSession()
  const authed = () => !!session().data?.user

  return (
    <div class="min-h-screen">
      <SiteHeader authed={authed()} />
      <main>
        <Hero authed={authed()} />
        <Logos />
        <Features />
        <HowItWorks />
        <Stats />
        <Comparison />
        <Faq />
        <Cta authed={authed()} />
      </main>
      <SiteFooter />
    </div>
  )
}
