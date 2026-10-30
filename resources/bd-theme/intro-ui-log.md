# Intro + UI Theme Change Log — "Rickshaw Sunburst" / §7 UI tokens

File → change map for the intro redesign and full 2D UI retheme (art-direction.md §5/§6/§7).

## JS (sources/Game)

| File | Change |
|---|---|
| `Overlay.js` | `colorA #201c2c → #12332b`, `colorB #14111d → #081410` (bottle-green enamel wipe; pattern texture now a shapla tile — see assets). |
| `World/Grid.js` | Void grid recolored: base `0x1b191f → 0x0d1f14`, minor lines `#8d55ff → #1f7a4d` (tea green), major lines `#675369 → #c9a227` (muted marigold). |
| `World/Intro.js` | (1) Loader ring: geometry thickness 0.04 → 0.15 with TSL petal-scallop modulation of the inner edge (`sin(angle × 8)`, base thickness still 0.04 at the thin points) — alpana-ring look; color still driven by `reveal.color` (DayCycles sets it to marigold). (2) Label loading patched compressed-aware: plain `texture` loader + `.png` when `!import.meta.env.VITE_COMPRESSED`, `.ktx` + `textureKtx` otherwise; PNG path sets `flipY=false` + Linear filters to match ktx orientation (shader flips v itself). (3) Label + sound button tinted cream `#f6ead2` instead of pure white. |
| `Title.js` | Tab-title emojis: 🚗 → 🛺, 🌳 → 🌴 (mechanics/prefix "Ramim" unchanged). |
| `Reveal.js` | Untouched (reveal color comes from DayCycles — owned by the world-colors agent). |

## DOM / CSS

| File | Change |
|---|---|
| `sources/index.html` | Google Fonts request extended with `Baloo Da 2:400;600;700;800` + `Galada`; three new font-preloader divs (galada / baloo-da-2 / hind-siliguri) with Bengali sample text so the Bengali unicode-range subsets actually download; intro decor markup added after the canvas (`.intro-backdrop` + `.intro-card` with tassels and স্বাগতম / RAMIM AHMED — PORTFOLIO card, all `aria-hidden`); `/intro/sound.ktx` preload → `/intro/sound.png` (matches the uncompressed runtime path). |
| `sources/style/intro.styl` (new) | Pure-CSS intro layer gated on `html.input-filter-intro` (class set by Inputs.js — the `#skip` path and class removal at step 1 fade it automatically). `.intro-backdrop`: z-index 2 over the canvas, 24-ray repeating-conic-gradient sunburst (panel-red `#c8102e` / dark-red `#8e1b1b` with thin `#20160f` ink keylines) on an oversized rotating ::before (60s/rev, paused when not intro), ~3% inline-SVG feTurbulence grain ::after, radial `mask-image` keeping a clear center window so the 3D alpana ring / start label / sound button stay visible; everything `pointer-events none`. `.intro-card`: z-index 3 — স্বাগতম (Galada, cream + 2px marigold offset text-shadow) over RAMIM AHMED — PORTFOLIO (Baloo Da 2 700, marigold, 0.2em tracking), rise-in animation, two swinging tinsel-tassel strings (magenta `#e4007c` / gold `#f2b32a` cards on a cream string, 3s alternate swing, phase-offset). Fade-out via opacity/visibility transitions when the class drops. |
| `sources/style/index.styl` | `@import url('./intro.styl')` appended. |
| `sources/style/fonts.styl` | `.fonts-loader` entries added for Galada / Baloo Da 2 / Hind Siliguri. |
| `sources/style/general.styl` | `html` background → static sunburst (bottle-green `#12332b` + same conic rays + soft center glow; visible only before the first WebGPU frame). Global font stack → `"Baloo Da 2", "Hind Siliguri", "Noto Sans Bengali", "Nunito"`; `.title` → Galada (Amatic SC fallback, weight 400); `.text` → Hind Siliguri; `.bn` fallback updated. `.text-danger #eab876 → #ffb347` (lantern). Buttons: base border/text cream `alpha(#f6ead2,.85)`, hover marigold border + cream text, `.is-success #b9e896 → #4ccb5f`, `.is-danger #f26d84 → #e03a4e`. Input group: neutral `#555555/#767676/#cccccc` → `alpha(#b9c4ae, …)` dims / cream hover; valid state `#e9c68f → #f5a800`; flag-select panel → green gradient. New `:focus-visible` glow `rgba(255,158,61,0.4)` (ui-focus-glow). |
| `sources/style/menu.styl` | Crimson trigger/close gradients `#8e1f3e/#1d1440` → panel-red `#c8102e/#8e1b1b`; panel gradients `#201c2c/#14111d` → `#12332b/#081410`; inner 1px frames white → marigold `#f5a800`; xbox key circles → cream; menu text/selection → cream/bottle-green; active nav item `#1f1b29 → #1a4438` (ui-bg-raised); nav icon accent `#e9c68f → #f5a800`. |
| `sources/style/map.styl` | Same gradient/frames swap; map-container frame → 2px marigold; DOM pins: pin `#e9c68f → #f5a800`, pin border `#14111d → #20160f` (ink), shadow ink; label bg `rgba(20,17,29,.92) → rgba(18,51,43,.92)` (bottle-green @92%), label border → `rgba(245,168,0,.45)`, label text → cream. |
| `sources/style/tooltips.styl` | ui-tooltip token: bg `#131019 → rgba(32,22,15,0.9)` (ink @90%), border → 1px `#f5a800`, text → `#f6ead2` (incl. the rotated caret). |
| `sources/style/notifications.styl` | bg gradient → solid `#1a4438` (ui-notification), left padding bumped and a jhalot scallop edge added (`::before` — r=6 marigold half-circle chain repeating down the left side); time-bar `#e9c68f → #f5a800`; success text `#b9e896 → #4ccb5f`, success fills → `#2e9e4f`; song amber `#f0c27d → #f5a800`; danger text `#f26d84 → #e03a4e`, danger fill → `#c8102e`; body text → cream. |
| `sources/style/achievements.styl`, `easter.styl` | Accent `#e9c68f → #f5a800`; success text → `#4ccb5f`, fills/borders → `#2e9e4f`; progress-bar frames → kantha running-stitch (`1px dashed alpha(#f5a800, 0.5)`); reward tile frame → marigold. |
| `sources/style/whispers.styl` | Message plaque `#201c2c → #12332b`, text → cream. |
| `sources/style/interactiveButtons.styl` | Bottom overlay `#14111d → #081410` family; touch-button voice: Amatic SC 64px → Baloo Da 2 700 40px (32px ≤520px), text cream. |
| `sources/style/controls.styl` | Key caps border `#ffffff33 → #f5a80055`. |
| `sources/style/modals.styl` | Text/selection → cream/bottle-green, panel gradient → green pair, xbox circle → cream. |
| `blackFriday.styl` | Untouched — not imported (commented out in index.styl). |

## Assets

| File | Change |
|---|---|
| `scripts/theme3-intro-assets.js` (new) | Generator. Bengali text via **sharp Pango/HarfBuzz** (`{ text: { fontfile } }`) — resvg (rustybuzz) was tested and mis-shapes Bengali (drops া vowel signs and inter-word spaces), so resvg is used only for pure-vector art (arrow, gamepad glyphs, speaker, shapla). Verifies dimensions + red-channel ink coverage; exit code 1 on failure. |
| `static/intro/mouseKeyboardLabel.png` | 256×128 white-on-black: চালু করতে / ক্লিক করুন (Baloo Da 2 Bold 30) + CLICK TO START (letterspaced) + hand-drawn arrow. Shader reads red channel only. |
| `static/intro/touchLabel.png` | শুরু করতে / চাপুন + TAP TO START + arrow. |
| `static/intro/gamepadXboxLabel.png` | শুরু করতে / চাপুন + Ⓐ glyph + PRESS A + arrow. |
| `static/intro/gamepadPlaystationLabel.png` | শুরু করতে / চাপুন + ⊗ glyph + PRESS ✕ (vector cross) + arrow. |
| `static/intro/sound.png` | 100×40 two-cell sprite redrawn (left speaker + waves, right speaker + ✕), 3px white round strokes. |
| `static/overlay/overlayPattern.png` | 128×128; ALPHA channel now an 8-petal shapla medallion with dot ring, blurred soft (enamel edge), peak alpha 173 (preserves the 0→0.68 remap at Overlay.js:36), fades to 0 before tile edges (seamless RepeatWrapping — verified 2×2 in `overlay-alpha-preview.png`). RGB kept white. |
| `resources/bd-theme/font-shaping-test.png`, `overlay-alpha-preview.png` | Working previews kept for reference. |

## Known limitations / notes

- The `.ktx` intro label/sound/overlay files are stale (old art) — no `toktx` on this machine. Irrelevant while `VITE_COMPRESSED` is empty (Intro.js is now compressed-aware); regenerate via `npm run compress` if compression is ever enabled.
- Reveal-ring / sky colors come from `DayCycles.js` (world-colors agent) — the ring geometry/scallop here just inherits that color.
- The full-screen sunburst behind the canvas only shows before the first rendered frame (the scene backgroundNode paints every pixel); during loading the animated sunburst shows as a masked ring *around* the 3D loader instead.
