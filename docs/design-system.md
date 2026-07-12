# Everlight Design System

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Solid.js via TanStack Start |
| Styling | Tailwind CSS v4 (CSS-based config, no JS config file) |
| UI Library | Custom components built on solid-ui/shadcn patterns |
| Icons | `lucide-solid` (outlined icons, always `strokeWidth={1.75}` unless noted) |
| Animations | `tailwindcss-animate` plugin |
| Class utility | `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.ts` |

## Theme

Defined in `src/styles.css` as CSS custom properties on `:root` with a
`@theme inline` block that maps them to Tailwind utility classes.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0a0f14` | Page background |
| `--foreground` | `#ffffff` | Body text |
| `--card` | `#0d1824` | Card, panel, sidebar backgrounds |
| `--card-foreground` | `#ffffff` | Text on cards |
| `--primary` | `#22e6f2` | Buttons, links, active states |
| `--primary-foreground` | `#06181c` | Text on primary |
| `--secondary` | `#0d1824` | Secondary surfaces |
| `--secondary-foreground` | `#ffffff` | Text on secondary |
| `--muted` | `#0d1824` | Muted backgrounds |
| `--muted-foreground` | `#8a9bab` | Secondary text, placeholders |
| `--accent` | `#22e6f2` | Highlights, focus rings (same as primary) |
| `--accent-foreground` | `#06181c` | Text on accent |
| `--border` | `rgba(255,255,255,0.08)` | Borders, dividers |
| `--input` | `rgba(255,255,255,0.12)` | Input borders |
| `--ring` | `#22e6f2` | Focus ring |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Destructive actions |

Opacity modifiers work with all color tokens: `bg-primary/10`, `text-foreground/80`,
`border-border/60`, etc.

### Radius

Base `--radius: 0.75rem` (12px). Derived:

| Token | Value |
|-------|-------|
| `--radius-sm` | `calc(var(--radius) * 0.6)` = ~7px |
| `--radius-md` | `calc(var(--radius) * 0.8)` = ~10px |
| `--radius-lg` | `var(--radius)` = 12px |
| `--radius-xl` | `calc(var(--radius) * 1.4)` = ~17px |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` = ~22px |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` = ~26px |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` = ~31px |

### Fonts

Loaded via `@fontsource/*` in `src/routes/__root.tsx`:

| Family | Weight | Tailwind class | Usage |
|--------|--------|----------------|-------|
| Inter | 400, 500, 600, 700 | `font-sans` | Body text |
| Space Grotesk | 400, 500, 600, 700 | `font-heading` | Headlines, titles |
| Geist Mono | 400, 500 | `font-mono` | Eyebrow labels, badges, code |

### Dark Mode

Only dark mode is supported. `color-scheme: dark` on `:root`. The `.dark`
variant class is available for future light-mode overrides.

### Base Styles

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

## Components (`src/components/ui/`)

### Button (`button.tsx`)

Shadcn-style button built with `class-variance-authority`.

**Variants:** `default` | `outline` | `secondary` | `ghost` | `destructive` | `link`

**Sizes:** `xs` | `sm` | `default` | `lg` | `icon` | `icon-xs` | `icon-sm` | `icon-lg`

```tsx
<Button variant="default" size="lg">
  Book a demo
  <ArrowRight class="size-4" />
</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost">Sign in</Button>
```

### Input (`input.tsx`)

```tsx
<Input
  type="email"
  value={email()}
  onInput={(e) => setEmail(e.currentTarget.value)}
  placeholder="you@example.com"
/>
```

### Label (`label.tsx`)

```tsx
<Label for="email">Email</Label>
```

### Badge (`badge.tsx`)

**Variants:** `default` | `secondary` | `outline`

```tsx
<Badge variant="outline">AI-Powered</Badge>
```

### Card (`card.tsx`)

Compound component: `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
`CardContent`, `CardFooter`.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### VoiceWaveform (`voice-waveform.tsx`)

Animated audio waveform bars used in the landing page hero and CTA sections.

```tsx
<VoiceWaveform class="my-6 opacity-70" />
```

## Landing Page Sections (`src/components/landing/`)

| Component | Section ID | Description |
|-----------|------------|-------------|
| `SiteHeader` | — | Fixed top nav with logo, scroll links, sign-in/get-started |
| `Hero` | — | Hero with badge, heading, CTA, floating call card + waveform |
| `Logos` | — | "Trusted by" social proof row |
| `Features` | `#features` | 6-column feature grid |
| `HowItWorks` | `#how-it-works` | 3-step process |
| `Stats` | `#capabilities` | 4 stat cards |
| `Faq` | `#faq` | Accordion FAQ |
| `Cta` | — | Final call-to-action card with waveform |
| `SiteFooter` | — | 4-column footer with links |

## Logo

Located at `public/logo.svg`. The SVG uses `@media (prefers-color-scheme)` to
invert between dark and light backgrounds.

Generate PNGs after changing the SVG:

```bash
bun run generate-icons
```

This produces `logo-192.png`, `logo-512.png`, and `favicon.png`.

## Favicon & PWA

Defined in `src/routes/__root.tsx`:

```tsx
{ rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
{ rel: 'apple-touch-icon', href: '/logo-192.png' },
```

## Icons

Use `lucide-solid` icons with `strokeWidth={1.75}` (default) or `strokeWidth={2}`
for CTA arrows. Icon containers follow this pattern:

```tsx
<span class="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
  <Icon class="size-5 text-primary" strokeWidth={1.75} />
</span>
```

## Design Patterns

- **Section spacing**: `py-20 sm:py-28`
- **Max widths**: `max-w-6xl` for full sections, `max-w-3xl`/`max-w-2xl` for centered content
- **Horizontal padding**: `px-4 sm:px-6`
- **Cards**: `rounded-2xl border border-border bg-card p-6`
- **Section titles**: Eyebrow `<span class="font-mono text-xs uppercase tracking-widest text-primary">` + heading `font-heading text-3xl sm:text-4xl font-bold`
- **Glow effect**: `radial-gradient(circle, #22E6F2 0%, transparent 70%)` with `blur-[120px]`
- **Button groups**: `flex flex-col sm:flex-row items-center justify-center gap-3`
- **Grid layouts**: `sm:grid-cols-2 lg:grid-cols-3`, `md:grid-cols-3`, `grid-cols-2 lg:grid-cols-4`
