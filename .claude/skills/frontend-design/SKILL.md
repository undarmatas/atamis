---
name: frontend-design
description: Design craft rules for building distinctive, high-quality frontend UI. Invoke BEFORE writing any frontend code (HTML/CSS/JS, landing pages, components, redesigns) — every session, no exceptions. Sets typography, color, depth, motion, and anti-generic standards.
---

# Frontend Design

You are building a website that should look like it was crafted by a senior designer — not generated. Follow every rule below. Where the project's CLAUDE.md or a reference image gives a more specific instruction, that wins.

## 1. Before writing code

1. Check `brand_assets/` — if logos, palettes, or style guides exist, use them exactly. Never placeholder over a real asset.
2. If a reference image exists: match it. Layout, spacing, typography, color — exact. Do not improve, add, or remove.
3. If designing from scratch: decide tone first (e.g. "warm editorial", "clinical precision", "brutalist tech") and let every choice serve it. Write the tone down as an HTML comment at the top of the file.

## 2. Typography

- **Pair two fonts**: a display face (serif, slab, or characterful sans) for headings + a clean sans for body. Never one font for both.
- Load via Google Fonts `<link>` with `display=swap`.
- Headings: tight tracking (`letter-spacing: -0.03em` at 48px+, `-0.02em` at 24–48px), line-height 1.05–1.2.
- Body: 16–18px, line-height 1.7, max-width ~65ch.
- Build a real scale (e.g. 13 / 15 / 18 / 24 / 36 / 56 / 80) — don't pick sizes ad hoc.
- Use `font-feature-settings` / `font-variant-numeric: tabular-nums` for stats and prices.

## 3. Color

- **Never** default Tailwind palette colors (indigo-500, blue-600, gray-*, etc.) as brand colors. Pick one custom brand hue; derive tints/shades from it in HSL (shift lightness, keep hue ±5°).
- Define the palette as CSS custom properties or a Tailwind config block — one source of truth.
- Neutrals must be tinted toward the brand hue (e.g. warm gray for an amber brand), never pure `#808080` grays.
- Ratio guide: ~60% background/neutral, ~30% secondary surface, ~10% accent. Accent appears in ≤3 places per viewport.
- Check text contrast: body ≥ 4.5:1, large headings ≥ 3:1.

## 4. Depth & surfaces

- Three-tier layering system: **base** (page bg) → **elevated** (cards, `1px` tinted border + subtle shadow) → **floating** (modals, popovers, sticky bars — stronger shadow + backdrop blur).
- **Never flat `shadow-md`.** Shadows are layered and color-tinted, low opacity:
  `box-shadow: 0 1px 2px hsl(var(--brand-hsl) / 0.06), 0 4px 12px hsl(var(--brand-hsl) / 0.08), 0 16px 32px hsl(var(--brand-hsl) / 0.06);`
- Borders on elevated surfaces: `1px solid` at 6–12% brand-tinted opacity, not gray-200.

## 5. Gradients & texture

- Backgrounds get depth from **layered radial gradients** (2–3, different positions/sizes, brand-tinted, low opacity) — never a single linear gradient.
- Add film grain via an inline SVG noise filter (`feTurbulence`) at 2–5% opacity over hero/ambient sections.
- Images always get: a gradient overlay (`bg-gradient-to-t from-black/60`) + a brand color layer with `mix-blend-multiply`.

## 6. Motion

- Animate **only** `transform` and `opacity`. Never `transition-all`, never animate layout properties.
- Spring-style easing: `cubic-bezier(0.22, 1, 0.36, 1)` for entrances, 150–250ms for hovers, 500–800ms for reveals.
- Scroll reveals: IntersectionObserver, translate-up 12–24px + fade, staggered 60–100ms between siblings.
- Respect `prefers-reduced-motion: reduce` — gate all non-essential animation behind it.

## 7. Interactive states — no exceptions

Every clickable element needs all three:
- `:hover` — visible change (lift via `translateY(-1px)` + shadow, or bg/color shift)
- `:focus-visible` — 2px brand-colored ring with offset (`outline: 2px solid; outline-offset: 2px`), never `outline: none` without replacement
- `:active` — press-down (`translateY(0)` / `scale(0.98)`)

Cursor `pointer` on all interactive elements. Disabled states get reduced opacity + `cursor-not-allowed`.

## 8. Spacing & layout

- Pick a spacing token set (e.g. 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128) and use only those values.
- Section vertical padding: generous — 96–128px desktop, 64–80px mobile.
- Related items sit closer than unrelated items (proximity = grouping). Card internal padding ≥ 24px.
- Mobile-first. Test the layout mentally at 375px, 768px, 1280px before writing.
- One consistent border-radius scale (e.g. 8 / 12 / 16 / 24px + full). Nested radii: inner = outer − padding.

## 9. Output conventions

- Single `index.html`, styles inline, Tailwind via CDN (`<script src="https://cdn.tailwindcss.com"></script>`), unless told otherwise.
- Custom values via a `tailwind.config` inline block or arbitrary values — keep the palette/type tokens in one place at the top.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT` only where no real asset exists.
- Semantic HTML (`header/nav/main/section/footer`), alt text on all images, `lang` on `<html>`.

## 10. Verify loop (mandatory)

1. Serve on localhost (`node serve.mjs`) — never screenshot `file:///`.
2. `node screenshot.mjs http://localhost:3000` → read the PNG with the Read tool.
3. Compare against reference/intent with **specific measurements** ("heading is 32px, reference ~24px"), fix, re-screenshot.
4. Minimum 2 comparison rounds. Stop only when no visible differences remain.
