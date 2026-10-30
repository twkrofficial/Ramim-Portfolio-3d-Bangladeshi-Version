# Sonar Bangla — 3D World Restyle Change Log

Theme-3 world repaint per `art-direction.md` §2 (master palette) and `recon-theming.md` §c (lever table).
Regenerate the palette anytime with `node scripts/theme3-palette-bd.js`.

## static/palette.png (via scripts/theme3-palette-bd.js — new file)

128x4 RGB, 24 flat 4px swatches, columns 96–127 black. Original safe at `resources/theme1-backup/palette.png`.

| # | Old (gold theme) | New | Role |
|---|---|---|---|
| 0 | `#706b88` | `#7a6e62` | structure shadow grey → warm mud-grey |
| 1 | `#e7d2a8` | `#f2e4c6` | cream walls/wood light → warm cream |
| 2 | `#4d4531` | `#454d26` | dark olive → tea-shadow olive |
| 3 | `#33a9d6` | `#7c9ea6` | sky blue accents → haor water |
| 4 | `#c9c5c6` | `#c9cfd1` | light grey → tin-roof silver |
| 5 | `#403833` | `#4e3b2a` | dark brown → nouka tarred timber |
| 6 | `#42464d` | `#464e52` | slate metal dark → wet slate / tin shadow |
| 7 | `#ecc5b2` | `#eac7a9` | pale pink plaster → mud-plaster pale |
| 8 | `#d2a018` | `#f5a800` | gold → marigold |
| 9 | `#7fa26c` | `#7cb342` | sage green → tea-bush top |
| 10 | `#d6946f` | `#c98b62` | terracotta light → sun-baked clay |
| 11 | `#8c7a5e` | `#8f7c55` | khaki → jute-stalk khaki |
| 12 | `#99a52f` | `#6fa544` | grass olive → warm terrain green |
| 13 | `#9a916f` | `#a29168` | grey-tan → weathered thatch |
| 14 | `#a3633c` | `#9c6b4a` | wood/terracotta → laterite |
| 15 | `#cf6a10` | `#dc7800` | orange → deep marigold |
| 16 | `#d63a20` | `#e03422` | red-orange → rickshaw enamel red |
| 17 | `#fbe9e3` | `#fbf0dd` | off-white → warm off-white |
| 18 | `#eda04f` | `#f2b32a` | amber → scallop-trim gold |
| 19 | `#a51132` | `#c8102e` | crimson → panel red |
| 20 | `#a55ce4` | `#cb3d9f` | purple → rickshaw-art magenta |
| 21 | `#de6590` | `#e86a9e` | pink → shapla pink |
| 22 | `#1e0603` | `#20160f` | near-black → ink |
| 23 | `#fff2e8` | `#fff9ef` | white → alpana warm white |

## sources/Game/Cycles/DayCycles.js — presets (intensities/ratios untouched)

| Preset | Field | Old | New |
|---|---|---|---|
| day | revealColor | `#5f7dff` | `#ffb347` (marigold loader ring) |
| day | lightColor | `#ffd2c2` | `#ffd98a` (haze sun) |
| day | shadowColor | `#6d3fff` | `#46604b` (green-grey multiply) |
| day | fogColorA (zenith) | `#00ffff` | `#7fb2d9` |
| day | fogColorB (horizon) | `#9b89ff` | `#f2d9a0` (dust gold) |
| dusk | revealColor | `#ff86d9` | `#ffa23c` |
| dusk | lightColor | `#ff8181` | `#ffa85c` (low marigold sun) |
| dusk | shadowColor | `#4e009c` | `#2e2a46` (violet-navy) |
| dusk | fogColorA | `#3e53ff` | `#31456e` (indigo-navy zenith) |
| dusk | fogColorB | `#ff4ce4` | `#ee9c3c` (deep marigold horizon) |
| night | revealColor | `#b678ff` | `#ffc24d` (lantern gold) |
| night | lightColor | `#3240ff` | `#4a5da8` (moonlit navy, luminance-matched) |
| night | shadowColor | `#2f00db` | `#101828` |
| night | fogColorA | `#10266f` | `#101b33` |
| night | fogColorB | `#490a42` | `#4a3b52` (violet horizon) |
| dawn | revealColor | `#ff9d9d` | `#ffb077` (rose-gold) |
| dawn | lightColor | `#ffa882` | `#ffc08c` |
| dawn | shadowColor | `#db004f` | `#564553` (rose-mauve) |
| dawn | fogColorA | `#f885ff` | `#96aec6` (pale misty blue) |
| dawn | fogColorB | `#ff7d24` | `#f6c495` (rose-gold mist) |

## sources/Game/Ligthing.js
- L89 bounceColor: `#6f4a86` → `#efcf9a` (§2 bounce light; uniform is currently not consumed by MeshDefaultMaterial — bounce there samples terrain color — so no brightness risk)
- L20 sun colorUniform `#ffffff` unchanged (driven per-tick by DayCycles lightColor — verified pass-through at update())

## sources/Game/Terrain.js
- height gradient 0.1: `#efa652` → `#d8b176` (warm silt bank)
- height gradient 0.3: `#4db4ae` → `#7c9ea6` (haor water)
- height gradient 0.9: `#0f2c50` → `#1c2b45` (deep night-navy water)
- grassColorUniform: `#a3ac33` → `#74a83e` (mix-biased so ground reads ~#6FA544; grass blades inherit)

## sources/Game/Fog.js
- placeholder colorA/colorB: `#ff0000`/`#0000ff` → `#7fb2d9`/`#f2d9a0` (cosmetic — overwritten each tick from DayCycles)

## sources/Game/Materials.js
- emissiveOrangeRadialGradient: `#ff8641`→`#ff3e00` ⇒ `#ffb347`→`#ff6f13` (hariken lantern; pole lights + lanterns)
- emissivePurpleRadialGradient: `#454bbc`→`#ff2eb4` ⇒ `#4b3fc8`→`#e4007c` (rickshaw magenta; luminance-normalized so bloom holds)
- emissiveBlueRadialGradient: `#91f0ff`→`#128fff` ⇒ `#9fe0ee`→`#1467b3` (peacock blue)
- emissiveGreenRadialGradient: `#f8ffa6`→`#74ff00` ⇒ `#f4ffa8`→`#56d42a` (leaf green)
- emissiveWhiteRadialGradient unchanged (neutral tube-light)
- redGradient: `#ff3a3a`→`#721551` ⇒ `#f42a41`→`#6e1430` (flag red into deep crimson)
- sky-reflection gradient stops: `#f2c368`/`#d75f85`/`#0d0b3e` → `#f2d9a0`/`#7c9ea6`/`#101b33` (§2 sky family)

## sources/Game/InteractivePoints.js
- backColor `#201c2c` → `#20160f` (ink); frontColor `#ffffff` → `#f6ead2` (cream)

## sources/Game/World/*
- Floor.js: slabHighColor `#efc98a` → `#f0d9a6` (cream slab); slabLowColor `#9a7060` → `#9c6b4a` (laterite)
- Scenery.js: road `#2c2833` → `#5c5a55` (warm bitumen; glitter params untouched)
- World.js trees (colorA = shadow side, colorB = lit side per Foliage normal-dot-light mix):
  - Birch → Krishnachura: `#e85630`/`#ef9245` → `#e64a19`/`#f28c3c`
  - Oak → Mango: `#a2ad3b`/`#c6c542` → `#2e5e2a`/`#4f8f3e`
  - Cherry → Radhachura: `#e96f84`/`#f5a1a4` → `#e86a9e`/`#f5a8c6`
- Bushes.js: `#a2ad3b`/`#c6c542` → `#33691e`/`#7cb342` (tea-row shadow → flush top; light-facing mix gives the stripe read)
- Leaves.js: `0x95513a`/`0xf56a3a` → `0xa6321c`/`0xf5541f` (krishnachura petals)
- Lightnings.js: `#ff4c00`/`#5180ff` → `#ff9e3d`/`#6fa8e8` (lantern core / monsoon blue)
- Confetti.js: `#ffbde7 #eeff95 #84ffb5` → `#ffd34d #ff8acf #8fe89b` (marigold / magenta / green festival)
- VisualTornado.js: `#ff544d` → `#e8452e` (krishnachura flame red)
- WaterSurface.js `0xffffff` kept — color comes from terrain gradient + refraction (per recon)
- PoleLights.js untouched — uses emissiveOrangeRadialGradient (now lantern)

## sources/Game/World/Areas/*
- CareerArea.js: `#5390ff #ff8039 #b65fff #a2ffab` → `#3d9be8 #ffa23c #ce64e8 #9be89b`
- CircuitArea.js: doorTarget `#32ffc1` → `#3ef0a0`; doorReached `#cbff62` → `#cdf04e`; `#d684ff` → `#f06ad8`; structural `#463F35` x2 kept (already warm wood-brown)
- CookieArea.js: flame mix `#ff3e00`→`#ff8641` ⇒ `#ff6f13`→`#ffb347`
- LabArea.js: flame mix same as Cookie; `#ff6b2b`/`#ff4100` → `#ffa23c`/`#ff6f13`; portal `#ff0083`/`#3018eb` → `#e4007c`/`#16418f`; structural `#6f6a87` x2 → `#7a6e62`
- ProjectsArea.js: `0x6F6A87` → `0x7A6E62`; `#a88c7f` → `#a9836a` (mud plaster); forge glow `#ff8641`/`#ff3e00` → `#ffb347`/`#ff6f13`
- AltarArea.js: `#ff544d` → `#e8452e`
- BehindTheSceneArea.js: bloom `#6053ff` → `#2e8bd9` (peacock)
- LandingArea.js: `0x6F6A87` → `0x7A6E62`
- AchievementsArea.js foam `#ffffff` kept (white foam correct on haor water)

## Intentionally untouched (other agents / out of scope)
VisualVehicle.js, Intro.js, Grid.js, Overlay.js, Reveal.js, Title.js, Cycles/Tornado.js weather override, Materials/MeshDefaultMaterial.js, all .styl / index.html / static/ui / static/vehicle / static/intro / static/overlay, BowlingArea accents (not in lever list, already theme-compatible).
