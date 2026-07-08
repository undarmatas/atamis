# Atamis — website

Vienpuslapė („one-page") UAB „Atamis" svetainė — inžinerinės bendrovės Vilniuje
pristatymas: teritorijų planavimas, susisiekimo komunikacijos, inžinerinė
infrastruktūra, architektūra, viešosios erdvės ir BIM projektai.

A single-page website for UAB Atamis, an engineering company in Vilnius.

## Tech

- Single `index.html` — HTML + Tailwind (CDN) + bespoke CSS/vanilla JS, no build step
- Bilingual LT/EN (LT default), toggled client-side
- Dark cinematic hero (video), sticky project deck, liquid-glass header,
  auto-sliding project gallery, light editorial body
- `assets/` — images and hero video

## Run locally

```bash
node serve.mjs
# → http://localhost:3000
```

`serve.mjs` is a zero-dependency static server with HTTP Range support
(so Safari plays the hero `<video>`).

## Notes

- Real photos are sourced from the original site; the hero video is a placeholder
  pending final footage.
- `.mcp.json` (local editor tooling / API keys) is intentionally **not** committed.
