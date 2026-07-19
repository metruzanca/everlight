import { createSignal, createMemo, onMount, onCleanup, Show, For } from 'solid-js'

export type SpendSeriesEntry = {
  date: string
  spend: number
}

export function SpendChart(props: {
  series: SpendSeriesEntry[]
  minutesUsed: number
  minutesIncluded?: number
}) {
  let containerRef: HTMLDivElement | undefined
  const [cw, setCw] = createSignal(0)

  onMount(() => {
    if (containerRef) {
      setCw(containerRef.offsetWidth)
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setCw(entry.contentRect.width)
        }
      })
      observer.observe(containerRef)
      onCleanup(() => observer.disconnect())
    }
  })

  const data = () => props.series
  const maxSpend = () => Math.max(...data().map((d) => d.spend), 1) * 1.15

  const pad = { t: 10, r: 8, b: 24, l: 40 }
  const ch = 200
  const cwVal = () => Math.max(cw() - pad.l - pad.r, 1)

  const x = (i: number) => pad.l + (i / Math.max(data().length - 1, 1)) * cwVal()
  const y = (v: number) => pad.t + ch - (v / maxSpend()) * ch

  const areaPath = () => {
    const d = data()
    if (d.length === 0) return ''
    const pts = d.map((entry, i) => `${x(i)},${y(entry.spend)}`)
    return `M${x(0)},${pad.t + ch} L${pts.join(' L ')} L${x(d.length - 1)},${pad.t + ch} Z`
  }

  const linePath = () => {
    const d = data()
    if (d.length === 0) return ''
    return d.map((entry, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(entry.spend)}`).join(' ')
  }

  const yTicks = () => {
    const max = maxSpend()
    const rawStep = max / 4
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const step = Math.ceil(rawStep / magnitude) * magnitude
    const ticks: number[] = []
    for (let v = 0; v <= max; v += step) {
      ticks.push(Math.round(v * 100) / 100)
    }
    return ticks
  }

  const [tooltipIdx, setTooltipIdx] = createSignal<number | null>(null)

  function handleMouseMove(e: MouseEvent) {
    if (!containerRef || data().length === 0) return
    const rect = containerRef.getBoundingClientRect()
    const mouseX = e.clientX - rect.left - pad.l
    const index = Math.round((mouseX / cwVal()) * (data().length - 1))
    setTooltipIdx(Math.max(0, Math.min(data().length - 1, index)))
  }

  function handleMouseLeave() {
    setTooltipIdx(null)
  }

  const tooltipInfo = createMemo(() => {
    const idx = tooltipIdx()
    if (idx == null || idx >= data().length) return null
    return { idx, entry: data()[idx] }
  })

  const totalSpend = () => data().reduce((s, entry) => s + entry.spend, 0)

  return (
    <section id="appointments">
      <div class="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-heading text-base font-semibold">Organization spend</h2>
            <p class="text-sm text-muted-foreground">Last 14 days</p>
          </div>
          <div class="text-right">
            <p class="font-heading text-2xl font-bold tracking-tight">
              ${totalSpend().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <Show when={props.minutesIncluded != null && props.minutesIncluded > 0 && props.minutesIncluded}>
              {(min) => (
                <p class="text-xs text-muted-foreground">
                  {props.minutesUsed.toLocaleString()} / {min.toLocaleString()} min used
                </p>
              )}
            </Show>
          </div>
        </div>

        <div ref={containerRef} class="mt-6 h-64 w-full relative">
          <Show when={data().length > 1}>
            <svg
              width={cw() || 600}
              height={ch + pad.t + pad.b}
              class="overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22e6f2" stop-opacity={0.35} />
                  <stop offset="100%" stop-color="#22e6f2" stop-opacity={0} />
                </linearGradient>
              </defs>

              <For each={yTicks()}>
                {(tick) => (
                  <g>
                    <line
                      x1={pad.l}
                      y1={y(tick)}
                      x2={cw() - pad.r}
                      y2={y(tick)}
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <text
                      x={pad.l - 6}
                      y={y(tick) + 4}
                      text-anchor="end"
                      fill="#8a9bab"
                      font-size="12"
                    >
                      ${tick}
                    </text>
                  </g>
                )}
              </For>

              <For each={data().filter((_, i) => i % 2 === 0)}>
                {(entry, i) => (
                    <text
                      x={x(i() * 2)}
                      y={ch + pad.t + 16}
                      text-anchor="middle"
                      fill="#8a9bab"
                      font-size="12"
                    >
                    {entry.date}
                  </text>
                )}
              </For>

              <path d={areaPath()} fill="url(#spendFill)" />
              <path d={linePath()} fill="none" stroke="#22e6f2" stroke-width={2} />

              <Show when={tooltipInfo()}>
                {(info) => (
                  <g>
                    <line
                      x1={x(info().idx)}
                      y1={pad.t}
                      x2={x(info().idx)}
                      y2={pad.t + ch}
                      stroke="#22e6f2"
                      stroke-opacity={0.3}
                      stroke-width={1}
                    />
                    <circle
                      cx={x(info().idx)}
                      cy={y(info().entry.spend)}
                      r={4}
                      fill="#22e6f2"
                      stroke="#0a0f14"
                      stroke-width={2}
                    />
                  </g>
                )}
              </Show>
            </svg>

            <Show when={tooltipInfo()}>
              {(info) => (
                <div
                  class="absolute pointer-events-none z-10"
                  style={{
                    left: `${x(info().idx)}px`,
                    top: `${y(info().entry.spend) - 8}px`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div class="rounded-lg border border-border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur whitespace-nowrap">
                    <p class="text-muted-foreground">{info().entry.date}</p>
                    <p class="mt-0.5 font-heading text-sm font-semibold text-primary">
                      ${info().entry.spend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </Show>
          </Show>

          <Show when={data().length <= 1}>
            <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
              Spend chart data will appear here once more call data is available.
            </div>
          </Show>
        </div>
      </div>
    </section>
  )
}
