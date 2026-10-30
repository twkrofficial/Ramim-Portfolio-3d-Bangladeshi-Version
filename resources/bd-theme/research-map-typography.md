# Map Design & Bengali Typography Research — Bangladeshi-Themed Portfolio Game

---

## 1. Map Aesthetics: What Makes a Map Feel "Bengali" Rather Than Generic-European

### Historical reference points

**Old Bengal survey maps (Rennell, 1780).** James Rennell's *A Bengal Atlas* (1780/81) is the canonical "old map of Bengal" look: dense braided river channels (the Ganges–Brahmaputra delta dominates every plate), pictorial relief, stippled sandbanks, and ornamental dedication cartouches in the corners of each of its twelve plates ([Sotheby's](https://www.sothebys.com/en/buy/auction/2020/fine-books-and-manuscripts-including-selections-from-the-collection-of-barbara-and-ira-lipman/rennell-james-the-rare-first-edition-of-a-bengal), [Internet Archive scan](https://archive.org/details/nby_925965), [UMich exhibit](https://apps.lib.umich.edu/online-exhibits/exhibits/show/india-maps/rennell)). **Caution:** Rennell's cartouches are neoclassical European (allegorical figures, scrollwork) — that is the *colonial* aesthetic. Borrow only his *hydrography*: the obsessive rendering of rivers as the dominant landscape feature. A Bengali map is a map of water first.

**Mughal-era mapping.** Mughal/pre-colonial maps of Bengal Subah (e.g., the Gentil atlas, ca. 1770) were pictorial and territorial rather than triangulated — cities as little painted vignettes, rivers as broad decorated ribbons, borders as floral illuminated frames ([Google Arts & Culture, Kalakriti Archives](https://artsandculture.google.com/story/cosmology-to-cartography-the-maps-depicting-the-early-encounter-with-indian-subcontinent-kalakriti-archives/3QXR1K0l9rcBKg?hl=en), [Heritage Lab](https://www.theheritagelab.in/map-subahs-mughal-empire/)). Useful takeaways: **buildings drawn in elevation, not plan** (a little mosque dome = a city), and **floral-illumination frames** rather than ruled neat-lines.

**Modern Bangladeshi tourist maps** tend to be bright green/red (flag colors), use icon-vignettes (Shaheed Minar, Ahsan Manzil, tea gardens for Sylhet, Sundarbans tiger), and label bilingually with Bangla on top.

### The four Bengali decorative vocabularies to use instead of European scrollwork

1. **Alpana (আলপনা)** — rice-flour floor painting. White line-work on a red/terracotta ground; freehand, radial/circular compositions expanding from a central lotus; motifs: lotus, paddy sheaves, fish, conch-shell creeper (shankhalata), kalka (paisley), wavy lines, dotted vines ([Wikipedia](https://en.wikipedia.org/wiki/Alpana), [Asia InCH](https://asiainch.org/craft/alpona-floor-painting-of-west-bengal/), [Artflute](https://www.artflute.com/blog/what-is-alpana-art)). → **Best for corner ornaments and the cartouche frame** — white-on-terracotta line art instantly reads Bengali.

2. **Nakshi kantha (নকশি কাঁথা)** — quilt embroidery built from the **running stitch**, which "typically produces a rippled effect"; traditional named border patterns include the wave border, ladder border, fish border, diamond (borfi) border, and the *lohori* "wave" kantha of Rajshahi ([Banglapedia](https://en.banglapedia.org/index.php/Nakshi_Kantha), [House of Wandering Silk](https://www.wanderingsilk.org/kantha-history-and-meaning)). Central lotus focal point with stylised birds/fish around it. → **Best for the map's stitched-dash route lines and inner border bands** (a dashed line that looks hand-sewn = roads/paths).

3. **Terracotta temple friezes** — Kantajew Mandir (Dinajpur) and Puthia-style repeating baked-clay panels: horizontal bands of identical square tiles with floral rosettes, elephant/horse processions, lotus-petal rows. → **Best for a repeating tile band** in the outer border (one SVG `<pattern>` tile repeated).

4. **Rickshaw art (রিকশাচিত্র)** — UNESCO Intangible Cultural Heritage since Dec 2023 ([UNESCO](https://www.unesco.org/en/articles/rickshaw-painting-colourful-heritage-bangladesh), [ICH listing](https://ich.unesco.org/en/RL/rickshaws-and-rickshaw-painting-in-dhaka-01589)). Enamel-paint saturation, bold outlines, flower chains, shapla (water lily — national flower), peacocks, tigers, film-poster lettering; border motifs derived from *pata chitra* scroll painting, and the scalloped cut-work comes from the *jhalot* appliqué-cutting tradition on hoods ([Daily Star](https://www.thedailystar.net/life-living/news/the-story-rickshaw-art-bangladesh-3488756), [Dhaka Tribune](https://www.dhakatribune.com/bangladesh/371913/rickshaw-art-a-rolling-canvas-that-paints), [Wikipedia](https://en.wikipedia.org/wiki/Rickshaw_painting_of_Bangladesh)). → **This is your primary palette + the scalloped outer edge + compass rose style.**

**Anti-patterns (things that read generic-European):** fleur-de-lis compass roses, acanthus scrollwork, sea monsters, parchment-sepia-only palettes, blackletter/Trajan-style cartouche type. Replace each with the Bengali equivalent below.

---

## 2. Bengali Typography Plan

All five candidates are on Google Fonts (OFL licensed — free to embed and rasterize commercially). Weights confirmed via specimen data ([Adobe Fonts Hind Siliguri page](https://fonts.adobe.com/fonts/hind-siliguri), [Ek Type Baloo repo](https://github.com/EkType/Baloo)):

| Font | Weights | Vibe | Role in the game |
|---|---|---|---|
| **Baloo Da 2** | 400–800 (variable) | Chubby, rounded, heavy — playful, toy-like, great at bold sizes | **Primary game-UI font**: place labels, buttons, HUD, "স্বাগতম" splash. The 700/800 weights feel like hand-painted rickshaw lettering. |
| **Galada** | 400 only, display | Flowing, brush-calligraphic, high contrast, confident swashes | **Cartouche title font**: "রামিম আহমেদ" and "মানচিত্র" in the title cartouche. Closest free font to rickshaw/film-poster brush lettering. Display sizes only (28px+). |
| **Tiro Bangla** | 400 + italic | Literary serif by Tiro Typeworks (John Hudson, Fiona Ross) — bookish, elegant, like metal-type Bangla | **Alternative cartouche/elegant option** and small flavor text (legends, captions). More "old atlas", less "rickshaw". |
| **Hind Siliguri** | 300–700 | Neutral humanist UI face by Indian Type Foundry, excellent conjunct coverage (820 glyphs) | **Workhorse fallback**: body copy, tooltips, anything small (12–16px) where Baloo/Galada get muddy. |
| **Noto Sans / Noto Serif Bengali** | Variable, huge weight+width range | Deliberately neutral, best glyph coverage of all | **Safety-net fallback** for any rare conjunct the others miss. |

**Recommended pairing:** `Galada` (cartouche titles) + `Baloo Da 2 SemiBold/Bold` (map labels & UI) + `Hind Siliguri` (small text). If you want the *elegant survey-map* mood instead of playful, swap Galada → Tiro Bangla.

### Downloading (self-hosting — required)

- **TTF:** fonts.google.com → each family page → "Get font" → Download all (or GitHub: [github.com/google/fonts](https://github.com/google/fonts) `ofl/balooda2`, `ofl/galada`, `ofl/tirobangla`, `ofl/hindsiliguri`, `ofl/notosansbengali`).
- **woff2 for the web build:** `npm i @fontsource/baloo-da-2 @fontsource/galada @fontsource/hind-siliguri` (Fontsource ships woff2 + CSS), or google-webfonts-helper (gwfh.mranftl.com). **Include `unicode-range: U+0980-09FF` plus Latin subsets in `@font-face`.**
- CSS stack: `font-family: "Baloo Da 2", "Hind Siliguri", "Noto Sans Bengali", sans-serif;`

### SVG → sharp rasterization (important gotchas)

Yes, they render — **but the font file must be installed/visible locally**, because sharp rasterizes SVG via **librsvg**, which resolves `font-family` through **fontconfig system fonts**, not `@font-face`/woff2 (webfont loading inside SVG is not supported by librsvg).

Options, most→least robust:
1. **Convert text to paths before rasterizing** (opentype.js / `text-to-svg` with the local TTF, or Harfbuzz via `harfbuzzjs` for correct conjunct shaping). Zero environment dependency; pixel-identical in CI. **Caveat:** naive opentype.js does *not* apply Bengali OpenType shaping (conjuncts/reph/vowel reordering will break — e.g., মানচিত্র's ত্র); prefer a shaping-aware path (HarfBuzz) or option 2.
2. **Install the TTFs into the OS font directory** (Windows: `C:\Windows\Fonts` or per-user fonts; Linux CI: copy to `/usr/share/fonts` + `fc-cache -f`) and reference plain `font-family="Baloo Da 2"` in the SVG. librsvg/Pango shapes Bengali correctly this way — this is the easiest correct route.
3. **`FONTCONFIG_PATH`/`fonts.conf`** pointing at a project `./fonts` dir of TTFs — same as 2 but repo-local, good for CI.

Use **TTF (not woff2)** for the rasterization pipeline; woff2 is for the browser build only.

---

## 3. Bengali Strings (spellings verified)

All spellings below are standard Bangla orthography (Bangladesh Bangla Academy conventions):

| Bangla | Transliteration | English | Notes |
|---|---|---|---|
| রামিম আহমেদ | Ramim Ahmed | (name) | আহমেদ is the standard Bangladeshi spelling (আহমদ also exists; আহমেদ is more common for names). |
| মানচিত্র | manchitro | map | Correct — ত্র conjunct (ta+ra-phala). |
| সিলেট | Sylhet | Sylhet | Correct official spelling. |
| বাংলাদেশ | Bangladesh | Bangladesh | Correct — anusvara ং, not ঙ. |
| স্বাগতম | shagotom | welcome | Correct — স্ব conjunct. |
| প্রকল্প | prokolpo | project(s) | Correct — প্র and ল্প conjuncts. |
| খেলাঘর | khelaghor | playhouse / playground | Correct; connotes a child's play-house — charming for a "playground" section. (Literal playground = খেলার মাঠ.) |
| গবেষণাগার | gobeshonagar | laboratory | Correct — note ষ + ণ (murdhanya) in গবেষণা. |
| কর্মজীবন | kormojibon | career / working life | Correct — র্ম (reph+ma), জী with dirgho-i. |
| যোগাযোগ | jogajog | contact / communication | Correct. |

Useful extras: আমার সম্পর্কে (about me), দক্ষতা (skills), বাড়ি (home), নদী (river), চা-বাগান (tea garden — Sylhet flavor), শুরু করুন (start/begin).

---

## 4. Concrete Map-Design Spec

### 4.1 Palette (rickshaw-art enamel, per sources above: "yellow, red, blue, green… fluorescent green, dark red" on dark grounds)

| Token | Hex | Use |
|---|---|---|
| `ground-dark` | `#12332B` | Deep bottle-green background (rickshaw hood green) |
| `panel-red` | `#C8102E` | Primary red — border band, cartouche ground |
| `dark-red` | `#8E1B1B` | Shadows on red, outer scallop backing |
| `marigold` | `#F5A800` | Gold-yellow — outlines, compass, flower chains |
| `leaf-green` | `#2E9E4F` | Land areas, foliage (brighter "fluorescent" accent `#4CCB5F` sparingly) |
| `peacock-blue` | `#1467B3` | Rivers/water |
| `sky-teal` | `#3BB3C3` | River highlights, secondary water |
| `shapla-pink` | `#E86A9E` | Flower accents, markers |
| `cream` | `#F6EAD2` | Alpana line-work, labels on dark, "rice-flour" white (`#FFF9EF` for pure alpana lines) |
| `ink` | `#20160F` | Bold outlines everywhere (rickshaw art = everything outlined) |

Rule: **every shape gets a 2–3px `ink` outline** — the bold outline is what makes flat SVG read as enamel painting.

### 4.2 Layer stack (bottom → top)

1. **`bg`** — `ground-dark` fill; optional very-low-opacity (4–6%) repeating kalka/paisley pattern tile.
2. **`water`** — river ribbons (dominant, Rennell-style braided delta) with wave pattern (4.5).
3. **`land`** — `leaf-green` masses, subtle darker-green stipple `<pattern>` (paddy texture).
4. **`areas`** — zones (প্রকল্প, খেলাঘর, গবেষণাগার…) as hand-drawn blobs, each tinted, edged with a nakshi-kantha running-stitch dashed inline (4.6).
5. **`roads`** — paths (4.6).
6. **`buildings/markers`** — Mughal-style elevation vignettes: tiny tea-garden rows + hills for সিলেট, dome/minaret, boat (nouka) on rivers.
7. **`labels`** — Bangla text with `cream` fill + `ink` `paint-order: stroke` halo.
8. **`ornament`** — compass rose, corner alpana, cartouche.
9. **`frame`** — scalloped border (4.3).

### 4.3 Scalloped border (jhalot/rickshaw-hood cut-work) — SVG geometry

Three concentric bands, outermost first:

- **Band A — scallop edge:** semicircular scallops pointing *inward*, radius `r = 24`, along the frame perimeter. Per repeat of width `2r`: `a 24 24 0 0 1 48 0` (chain of half-circle arcs along each edge; at corners place a larger quarter-flower rosette, r=36, to turn the corner). Fill `panel-red`, stroke `ink` 3px, and inside each scallop a `marigold` dot (r=5) at the scallop's center — the classic rickshaw appliqué look. Optionally a second offset scallop row in `dark-red` behind it (drop-shadowed layered cut-work).
- **Band B — terracotta frieze band:** 28px flat band, `cream` ground, with a repeating `<pattern>` tile (56×28): alternating lotus-rosette (8-petal, petals = `M0,-10 Q4,-4 0,0 Q-4,-4 0,-10` rotated ×8) and kalka/paisley (`M0,0 C10,-14 2,-22 -4,-14 C-8,-8 -4,-2 0,0` with an interior echo curve), stroked `dark-red`, no fill — imitating carved terracotta panels.
- **Band C — kantha stitch inline:** 2 parallel dashed lines, `stroke: marigold; stroke-width:2.5; stroke-dasharray: 7 5; stroke-linecap: round`, the second line offset by half a dash (dashoffset 6) → reads as hand running-stitch, slight ripple via a low-amplitude sine path rather than a straight line (`q 14 1.5 28 0` repeated).

### 4.4 Compass rose — rickshaw style (উ/দ/পূ/প for N/S/E/W)

Not a fleur-de-lis star; build it as a **painted flower medallion**:
- Center: shapla (water-lily) — `shapla-pink` 8-petal flower, `marigold` center dot, `ink` outlines.
- Cardinal points: 4 long petal-blades (lotus-petal shape, not spear-points): `M0,-70 C10,-40 10,-18 0,-12 C-10,-18 -10,-40 0,-70`, filled `panel-red` with `marigold` inner echo petal; N petal slightly larger.
- Intercardinals: 4 shorter leaves in `leaf-green`.
- Ring: `peacock-blue` circle band with `cream` dot chain (like tinsel studs).
- Letters: **উ** (উত্তর/N) at top, **দ** (দক্ষিণ/S), **পূ** (পূর্ব/E), **প** (পশ্চিম/W) — in Baloo Da 2 Bold, `cream`. This alone makes the map unmistakably Bengali.

### 4.5 Rivers — traditional wave motifs

Use the *lohori* (wave) kantha / alpana wavy-line vocabulary: river = wide ribbon (`peacock-blue`, `ink` outline) filled with a repeating wave `<pattern>` (tile 40×16): two stacked scallop-wave rows `M0,8 Q10,0 20,8 Q30,16 40,8` in `sky-teal` at 60% opacity, offset half-tile per row (fish-scale water — also seen in pata-chitra water). Add occasional `cream` fish silhouettes (nakshi-kantha fish motif) and a small nouka (country boat) sprite. Banks: dotted `cream` stipple line just inside the edge (Rennell's sandbank stipple, recolored).

### 4.6 Roads & areas ("hand-painted" reading)

- **Roads:** double line — 6px `marigold` under-stroke, over it 3px `ink` dashed `stroke-dasharray: 10 7` → a stitched kantha path. Use `stroke-linecap: round` and draw with slight hand-wobble (jitter path nodes ±1.5px, or a subtle `feTurbulence`+`feDisplacementMap` filter (baseFrequency 0.012, scale 2.5) on the whole roads layer).
- **Areas/zones:** irregular blob outlines (never straight polygons); border = solid 3px `ink` + inner `cream` running-stitch dash; fill = zone tint at full saturation (rickshaw art doesn't do pastels). Each zone gets one vignette icon + label plaque: small scalloped-edge rectangle (mini version of Band A scallops, r=6) in `panel-red` with `cream` Baloo Da 2 text — like a rickshaw nameplate.
- **Cartouche (title box):** top-center or corner; `panel-red` rounded panel, scalloped lower edge, flanked by two symmetric alpana creepers (shankhalata vine: repeated `M0,0 q8,-10 16,0 q8,10 16,0` with alternating leaf/lotus buds) in `cream`; peacock or twin doves (rickshaw favorites) perched on top corners; text: **মানচিত্র** small (Baloo Da 2 600) over **রামিম আহমেদ** large (Galada, `cream` with `marigold` 1px offset under-copy for a sign-painter double-stroke).
- **Corner alpana motifs:** in each map corner (inside Band C), a quarter-radial alpana: concentric arcs + dotted rings + kalka pair + lotus quarter, all `#FFF9EF` stroke-only (2px, round caps) on the `ground-dark` — the white-on-dark rice-flour look. Build once as a `<symbol>`, mirror ×4.

### 4.7 Finishing filters

- Global paper/enamel grain: 3% opacity `feTurbulence` fractal noise overlay.
- All ornament strokes: `stroke-linecap/linejoin: round` (brush, not pen).
- Slight color darkening at panel edges (radial gradient overlay, 8% black) = enamel paint pooling.

---

### Sources
- [Sotheby's — Rennell, A Bengal Atlas first edition](https://www.sothebys.com/en/buy/auction/2020/fine-books-and-manuscripts-including-selections-from-the-collection-of-barbara-and-ira-lipman/rennell-james-the-rare-first-edition-of-a-bengal) · [Internet Archive — A Bengal Atlas scan](https://archive.org/details/nby_925965) · [UMich — James Rennell exhibit](https://apps.lib.umich.edu/online-exhibits/exhibits/show/india-maps/rennell) · [ResearchGate — Plate IX cartouche analysis](https://www.researchgate.net/figure/A-Map-of-Bengal-and-Bahar-Plate-IX-James-Rennell-An-Atlas-of-Bengal-1781-The_fig1_380468758)
- [Google Arts & Culture — Cosmology to Cartography (Kalakriti Archives)](https://artsandculture.google.com/story/cosmology-to-cartography-the-maps-depicting-the-early-encounter-with-indian-subcontinent-kalakriti-archives/3QXR1K0l9rcBKg?hl=en) · [Heritage Lab — Mapping the subahs](https://www.theheritagelab.in/map-subahs-mughal-empire/)
- [Wikipedia — Alpana](https://en.wikipedia.org/wiki/Alpana) · [Asia InCH — Alpona floor painting](https://asiainch.org/craft/alpona-floor-painting-of-west-bengal/) · [Artflute — What is Alpana Art](https://www.artflute.com/blog/what-is-alpana-art)
- [Banglapedia — Nakshi Kantha](https://en.banglapedia.org/index.php/Nakshi_Kantha) · [House of Wandering Silk — Kantha history](https://www.wanderingsilk.org/kantha-history-and-meaning)
- [UNESCO — Rickshaw painting heritage](https://www.unesco.org/en/articles/rickshaw-painting-colourful-heritage-bangladesh) · [UNESCO ICH listing](https://ich.unesco.org/en/RL/rickshaws-and-rickshaw-painting-in-dhaka-01589) · [Daily Star — Story of rickshaw art](https://www.thedailystar.net/life-living/news/the-story-rickshaw-art-bangladesh-3488756) · [Dhaka Tribune — Rickshaw art](https://www.dhakatribune.com/bangladesh/371913/rickshaw-art-a-rolling-canvas-that-paints) · [Wikipedia — Rickshaw painting of Bangladesh](https://en.wikipedia.org/wiki/Rickshaw_painting_of_Bangladesh)
- [Adobe Fonts — Hind Siliguri](https://fonts.adobe.com/fonts/hind-siliguri) · [Ek Type — Baloo repo (OFL)](https://github.com/EkType/Baloo) · [Google Fonts repo](https://github.com/google/fonts)