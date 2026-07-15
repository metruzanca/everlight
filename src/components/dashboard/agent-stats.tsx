import { AudioLines, ArrowUpRight } from 'lucide-solid'

export type AgentStat = {
  name: string
  calls: number
  booked: number
  successRate: number
  avgDuration: string
}

export function AgentStats(props: { agents: AgentStat[] }) {
  return (
    <section id="voice-agents">
      <div class="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-heading text-base font-semibold">Voice agents</h2>
            <p class="text-sm text-muted-foreground">Performance this month</p>
          </div>
          <AudioLines class="size-5 text-primary" strokeWidth={1.75} />
        </div>

        {props.agents.length > 0 ? (
          <ul class="mt-5 flex flex-col gap-3">
            {props.agents.map((agent) => (
              <li class="rounded-xl border border-border bg-background/40 p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-medium">{agent.name}</p>
                  <span class="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <ArrowUpRight class="size-3" strokeWidth={2} />
                    {agent.successRate}%
                  </span>
                </div>
                <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="font-heading text-sm font-semibold">{agent.calls}</p>
                    <p class="text-xs text-muted-foreground">Calls</p>
                  </div>
                  <div>
                    <p class="font-heading text-sm font-semibold">{agent.booked}</p>
                    <p class="text-xs text-muted-foreground">Booked</p>
                  </div>
                  <div>
                    <p class="font-heading text-sm font-semibold">{agent.avgDuration}</p>
                    <p class="text-xs text-muted-foreground">Avg</p>
                  </div>
                </div>
                <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
                  <div class="h-full rounded-full bg-primary" style={{ width: `${agent.successRate}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div class="mt-5 flex items-center justify-center rounded-xl border border-dashed border-border bg-background/20 py-8 text-sm text-muted-foreground">
            Agent performance data will appear once calls are logged.
          </div>
        )}
      </div>
    </section>
  )
}
