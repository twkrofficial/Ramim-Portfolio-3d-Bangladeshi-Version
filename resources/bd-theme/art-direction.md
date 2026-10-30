# SONAR BANGLA — Definitive Art Direction
### Bangladeshi theme conversion of Folio 2025 for Ramim Ahmed (Sylhet, Bangladesh)

---

## 1. Theme Name & Vision

**সোনার বাংলা — "Sonar Bangla" (Golden Bengal).**
The world is a low-poly Sylhet: warm yellow-green village terrain striped with tea-garden rows and emerald paddies, silver haor water mirroring a hazy gold-dust sky, tin-roof homesteads, red brick, and a krishnachura in flame bloom. The player drives a fully decorated Dhaka cycle-rickshaw — UNESCO-listed rolling folk art — and every 2D surface (map, intro, UI) speaks the rickshaw-painter's language: hyper-saturated enamel colors, bold ink outlines, scalloped jhalot cut-work, alpana line-work, and nakshi-kantha stitch borders. Nothing sepia, nothing European: water is the dominant landscape feature, buildings are drawn in elevation, and the flag pair (bottle green + red) appears sparingly so it feels earned. Day is humid golden haze; night is warm navy-violet lit by lantern glow — never pitch black.

---

## 2. MASTER PALETTE

One rule: terrain greens stay warm/yellow-shifted; cool blue-greens are reserved for water, tea-row shadow, and banana leaf. Night = darkened, navy-shifted day, holding warmth near light sources.

| Element | Day hex | Night hex |
|---|---|---|
| Grass / terrain | `#6FA544` | `#2C4636` |
| Paddy accent (young emerald) | `#3FAE49` | `#1F4F35` |
| Paddy harvest-gold variant | `#D9B23C` | `#6E5A2E` |
| Tea-garden bush top | `#7CB342` | `#36512C` |
| Tea-garden row shadow | `#33691E` | `#1A2E18` |
| Dirt road (laterite) | `#9C6B4A` | `#4A3A34` |
| Paved road (warm bitumen) | `#5C5A55` | `#2E3038` |
| Water (haor / river) | `#7C9EA6` | `#1C2B45` |
| Water — pond variant | `#4A7A5C` | `#20362E` |
| House walls (mud plaster; tin variant `#B8BDBB`, bamboo weave `#C4A265`) | `#A9836A` | `#4E4148` |
| Tin roofs (silver; rust variant `#8A4B2E`, painted green `#2F6B4F`, painted red `#9E3B2B`) | `#C9CFD1` | `#5A6578` |
| Brick / kiln chimney | `#B0492F` | `#4E2530` |
| Tree 1 — Krishnachura foliage (flame red-orange, retinted birch) | `#E64A19` | `#7A2E24` |
| Tree 2 — Mango / silver-oak foliage (dense green) | `#2E5E2A` | `#16301F` |
| Tree 3 — Radhachura / pink-blossom foliage | `#E86A9E` | `#6E3A55` |
| Sky gradient — zenith | `#7FB2D9` | `#101B33` |
| Sky gradient — mid | `#C9D9C9` | `#233252` |
| Sky gradient — horizon | `#F2D9A0` | `#4A3B52` |
| Sun / Moon | `#FFD98A` | `#DCE8F5` |
| Shadow tint (multiply) | `#46604B` | `#101828` |
| Bounce light | `#EFCF9A` | `#3A2F52` |
| Lantern glow (hariken) | `#FFB347` | `#FF9E3D` |
| UI accent — gold | `#F5A800` | `#FFC24D` |
| UI accent — red | `#C8102E` | `#E03A4E` |
| UI accent — green (flag bottle green) | `#006A4E` | `#1E8A6A` |

Reserved hero pair: flag green `#006A4E` + flag red `#F42A41` — flags, one roof, one rickshaw hood, UI hero moments only.

---

## 3. RICKSHAW SPEC — hero vehicle

Classic Dhaka tricycle rickshaw, low-poly, flat material colors, one hand-painted texture only (rear art board).

**Proportions (meters):** overall length **2.5**, width **1.15**, height with hood up **1.9**. All three wheels **0.66** dia (thin tires). Bench seat height **0.75**, hood apex **1.9**, rear track **0.9**, wheelbase **1.6**, rear art board **0.45 × 0.25** mounted low between rear wheels. Stylized ratio check: wheel dia = 1 u → length 3.6 u, hood apex 2.8 u, bench width 1.6 u.

**Build order & per-part colors:**

| Part | Primitives | Hex |
|---|---|---|
| Frame (bicycle front half + rear cradle, swan-neck tubes) | 6-sided bent cylinders | `#1C1E22` |
| Front fork + wide swept-back handlebar + bell | cylinders; bell sphere | `#1C1E22`, chrome `#E8EAEE` |
| Wheels ×3 | torus tire + disc/8-spoke cylinder fan | tire `#2A2A2A`, rim/spokes `#C9CDD4` |
| Saddle (driver) | flattened wedge | `#2A2A2A` |
| Passenger bench + tilted backrest (rexine, silver piping) | box + tilted box | `#C0242B`, piping `#E8EAEE` |
| Folding hood (kamani): 4 nested arc bands, each ~8% smaller front-to-back, + scalloped valance flap quad | arc extrusions + quad | vinyl `#8C1B2F`, scallop trim + appliqué medallions `#F2B32A` |
| Hood appliqué medallion (center of hood back) | flat decal | rose `#E4007C` on `#F2B32A` ring |
| Footboard | flat box | `#1C1E22` with `#FFC907` striping |
| Rear mudguards + apron | quarter-cylinder shells | `#8C1B2F` with `#FFC907` border lines |
| **Rear art board (hero texture)** | single quad, 45×25 cm | bg `#1F3FA8`; peacock body `#1FA637`, flowers/lettering `#E4007C`, petals/border `#FFC907`, keylines near-black, white outlines |
| Side panels | flat quads | `#1F3FA8` with `#E4007C`/`#FFC907` floral scroll |
| Tassels/tinsel (3–5 cards on handlebar ends + hood rim, sine-wave jitter) | small cards | `#E4007C` + `#F2B32A` alternating |

Paint strategy: flat vertex/material colors everywhere; the single painted rear quad is what makes it read "Dhaka rickshaw."

**Secondary skin — CNG auto-rickshaw green:** for the alt vehicle or alt livery, body `#2E8B2E`, shaded panels `#1F6B24`, mesh grille `#6E7370`, yellow trim/roof sign `#F5C518`. (Bajaj-type: rounded nose box + cabin box + three ~0.3 m wheels, ~2.6 × 1.3 × 1.7 m.)

---

## 4. MAP SPEC — 1024×1024

**Background treatment of the original terrain render:** keep the existing top-down terrain render as the base layer, then (1) gradient-map it toward the Sonar Bangla greens — shadows to `#12332B`, mids to `#2E9E4F`, highlights to `#7CB342`; (2) overlay a 5%-opacity repeating kalka/paisley pattern tile; (3) trace all roads and water with the overlays below so the render reads as underpainting, not photo.

**Palette (rickshaw-enamel tokens):** ground-dark `#12332B` · panel-red `#C8102E` · dark-red `#8E1B1B` · marigold `#F5A800` · leaf-green `#2E9E4F` (fluorescent accent `#4CCB5F`, sparingly) · peacock-blue `#1467B3` · sky-teal `#3BB3C3` · shapla-pink `#E86A9E` · cream `#F6EAD2` (pure alpana lines `#FFF9EF`) · ink `#20160F`. **Every shape gets a 2–3 px ink outline.**

**Border (outermost → in):**
- **Band A — jhalot scallops:** inward-pointing half-circle scallops, r=24 px (arc chain `a 24 24 0 0 1 48 0`), fill panel-red, 3 px ink stroke, marigold dot (r=5) in each scallop; second offset scallop row in dark-red behind; r=36 quarter-flower rosettes at corners.
- **Band B — terracotta frieze:** 28 px cream band, repeating 56×28 tile alternating 8-petal lotus rosette and kalka paisley, stroked dark-red, no fill.
- **Band C — kantha stitch:** two parallel dashed marigold lines (`stroke-width 2.5; dasharray 7 5; linecap round`), second offset half a dash, drawn on a low-amplitude sine path.

**Compass rose (painted flower medallion, NOT fleur-de-lis):** shapla-pink 8-petal center + marigold dot; 4 cardinal lotus-petal blades in panel-red with marigold echo (N slightly larger); 4 intercardinal leaf-green leaves; peacock-blue ring with cream dot chain; letters **উ / দ / পূ / প** in Baloo Da 2 Bold, cream.

**Cartouche (top-center):** panel-red rounded panel with scalloped lower edge, flanked by symmetric cream shankhalata alpana vines, twin doves on top corners. Text: **মানচিত্র** small (Baloo Da 2 600) above **রামিম আহমেদ** large (Galada, cream with 1 px marigold offset under-copy) above **RAMIM AHMED** letterspaced (Baloo Da 2 700, marigold, small caps size).

**Area labels — bilingual, Bangla first:** প্রকল্প / PROJECTS · খেলাঘর / PLAYGROUND · গবেষণাগার / LAB · কর্মজীবন / CAREER · যোগাযোগ / CONTACT · আমার সম্পর্কে / ABOUT · চা-বাগান / TEA GARDEN · সিলেট / SYLHET · বাড়ি / HOME. Labels: cream fill, ink halo (`paint-order: stroke`), each zone on a mini scalloped panel-red nameplate (scallop r=6).

**Restyle overlays:** rivers as dominant Rennell-style braided ribbons in peacock-blue with ink outline, filled with a 40×16 fish-scale wave pattern in sky-teal @60%, cream dotted sandbank stipple inside banks, occasional cream kantha-fish and a nouka sprite. Roads: 6 px marigold under-stroke + 3 px ink dash (`10 7`, round caps), ±1.5 px hand-wobble (or feTurbulence 0.012 / scale 2.5 on the layer). Zones: irregular blobs, 3 px ink border + inner cream running-stitch dash, full-saturation tints. Markers: Mughal-style elevation vignettes (tea rows + hills for Sylhet, dome, nouka). Corner ornaments: quarter-radial alpana `<symbol>` in `#FFF9EF` stroke-only, mirrored ×4. Finish: 3% feTurbulence grain + 8% black radial edge-darkening (enamel pooling).

**Day vs night variants:** Day = spec above. Night = multiply terrain base with `#233252` at 55% and swap water fill to `#1C2B45` with a cream moon-glint streak; keep border/cartouche/compass unchanged (enamel paint doesn't sleep); labels stay cream; add lantern-gold `#FF9E3D` glow dots at settlement markers and a 4 px outer glow on route lines in marigold @35%.

---

## 5. INTRO / LOADING SPEC — "Rickshaw Sunburst"

A distinct 2D style, bolder than the map: pure rickshaw-panel painting.

- **Backdrop:** full-screen sunburst — 24 alternating rays of panel-red `#C8102E` and dark-red `#8E1B1B` radiating from center on ground-dark `#12332B`, rays given the 2 px ink outline and a 3% grain. Rotates slowly (60 s/rev, linear, infinite).
- **Loader:** an **alpana ring** — three concentric stroke-only circles in `#FFF9EF` (dotted ring, solid ring, petal-scallop ring) that self-draw via `stroke-dashoffset` mapped to load progress; at 100%, eight lotus petals pop outward from the ring (scale 0→1, back-ease, 60 ms stagger) and a marigold `#F5A800` shapla dot blooms in the center.
- **Text:** **স্বাগতম** in Galada, cream `#F6EAD2` with 2 px marigold offset under-copy (sign-painter double stroke), fades/rises in at 40% load; beneath it **RAMIM AHMED — PORTFOLIO** in Baloo Da 2 700, marigold, letterspaced 0.2 em.
- **Garnish:** two tinsel-tassel strings (magenta `#E4007C` + gold `#F2B32A` cards) hanging from the top corners, swinging on a 3 s sine; a tiny rickshaw silhouette rides along the bottom edge as a secondary progress indicator.
- **Exit:** rays iris-wipe outward, ring petals scatter, world fades up from the horizon-gold sky stop `#F2D9A0`.

---

## 6. TYPOGRAPHY

All OFL-licensed, free for commercial embedding.

| Font | Role |
|---|---|
| **Galada** (400, display) | Cartouche titles, স্বাগতম splash, hero headings — closest free font to rickshaw brush lettering. 28 px+ only. |
| **Baloo Da 2** (400–800 variable) | Primary UI: map labels, buttons, HUD, nameplates. Use 600–700 for the hand-painted feel. |
| **Hind Siliguri** (300–700) | Body copy, tooltips, anything ≤16 px. |
| **Noto Sans Bengali** | Safety-net fallback for rare conjuncts. |

**Sources:** Google Fonts family pages (TTF via "Get font"), or `github.com/google/fonts` → `ofl/galada`, `ofl/balooda2`, `ofl/hindsiliguri`, `ofl/notosansbengali`. Web build: `npm i @fontsource/baloo-da-2 @fontsource/galada @fontsource/hind-siliguri` (woff2 + CSS); include `unicode-range: U+0980-09FF` plus Latin subsets.
**CSS stack:** `font-family: "Baloo Da 2", "Hind Siliguri", "Noto Sans Bengali", sans-serif;`
**Raster pipeline (sharp/librsvg):** use TTFs, not woff2 — install to the OS font dir or point `FONTCONFIG_PATH` at a repo-local `./fonts` + `fonts.conf` so Pango shapes conjuncts (ত্র, স্ব, র্ম) correctly; do not path-convert with naive opentype.js (breaks Bengali shaping — use HarfBuzz if paths are required).

---

## 7. UI THEME — replacing the gold theme

| Token | Hex | Use |
|---|---|---|
| `ui-bg` | `#12332B` @ 92% | Menu/panel background (bottle-green enamel) |
| `ui-bg-raised` | `#1A4438` | Cards, dropdowns, tooltip body |
| `ui-border` | `#F5A800` | Panel frames, 2 px, with kantha-dash variant (`dasharray 7 5`) for secondary frames |
| `ui-outline` | `#20160F` | 2 px ink outline on every UI shape |
| `ui-text` | `#F6EAD2` | Primary text |
| `ui-text-dim` | `#B9C4AE` | Secondary text |
| `ui-accent` | `#F5A800` | Highlights, active states, progress fills (day) / `#FFC24D` (night) |
| `ui-primary-btn` | `#C8102E` fill, `#F5A800` border, `#F6EAD2` text | Buttons, scalloped-corner nameplate shape |
| `ui-hover` | `#E03A4E` | Button/row hover |
| `ui-success` | `#2E9E4F` | Confirmations, notifications-positive |
| `ui-error` | `#C8102E` | Errors |
| `ui-info` | `#1467B3` | Info toasts, links |
| `ui-tooltip` | `#20160F` @ 90% bg, `#F6EAD2` text, `#F5A800` 1 px border | Tooltips |
| `ui-notification` | `#1A4438` bg, left bar `#F5A800`, scalloped left edge (r=6) | Toasts |
| `ui-focus-glow` | `#FF9E3D` @ 40% | Focus rings, night-mode emphasis |

Ornament rules: notification/menu panels get the mini jhalot scallop edge (r=6) on one side only; modal frames use the Band C kantha double-dash inside a marigold border; loading spinners reuse the alpana ring from the intro at small scale. Flag red `#F42A41` and flag green `#006A4E` appear only on the hero CTA and the map cartouche flag pin.