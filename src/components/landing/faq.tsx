import { createSignal } from 'solid-js'
import { Plus, Minus } from 'lucide-solid'

const faqs = [
  {
    q: 'Do the agents sound robotic?',
    a: 'No. Powered by ElevenLabs voices and Vapi orchestration, our agents sound natural, warm, and human — most callers can\'t tell the difference.',
  },
  {
    q: 'Can it connect to my existing tools?',
    a: 'Yes. Everlight integrates with your phone number, calendar, CRM, and knowledge base so agents can take real actions like booking and updating records.',
  },
  {
    q: 'What happens with complex requests?',
    a: 'Agents handle the vast majority of calls end to end. When something needs a human, they capture context and warm-transfer or escalate instantly.',
  },
  {
    q: 'How many languages are supported?',
    a: 'Agents converse fluently in 30+ languages and can detect and switch languages automatically within a single call.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most businesses are live within a day. Connect your systems, pick a voice, define what to handle, and go.',
  },
]

export function Faq() {
  const [open, setOpen] = createSignal<number | null>(0)

  return (
    <section id="faq" class="py-20 sm:py-28">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <span class="font-mono text-xs uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 class="mt-4 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </div>

        <div class="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open() === i
            return (
              <div
               
                class="rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span class="font-heading font-medium">{item.q}</span>
                  {isOpen ? (
                    <Minus
                      class="size-5 shrink-0 text-primary"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Plus
                      class="size-5 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  )}
                </button>
                {isOpen && (
                  <p class="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
