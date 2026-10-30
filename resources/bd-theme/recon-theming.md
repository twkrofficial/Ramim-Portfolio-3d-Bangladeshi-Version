# World Theming Pipeline Recon — B:\Ramim Profile Site

## (a) palette.png pixel map

`B:\Ramim Profile Site\static\palette.png` — **128 x 4 px, RGB (3ch)**. Layout: **24 swatches, each 4 px wide x 4 px tall (full height)**, occupying x = 0..95; x = 96..127 is unused `#000000`. Swatch N covers columns `[N*4, N*4+3]`. Rows are near-identical (±1 LSB noise from a past ktx round-trip); treat each swatch as one flat color. Canonical values (row 0):

| # | x-range | hex | likely use (from Bruno's folio) |
|---|---------|-----|------|
| 0 | 0–3 | `#706b88` | grey-purple (rock/structure shadow) |
| 1 | 4–7 | `#e7d2a8` | cream (walls/wood light) |
| 2 | 8–11 | `#4d4531` | dark olive |
| 3 | 12–15 | `#33a9d6` | sky blue (accents/water props) |
| 4 | 16–19 | `#c9c5c6` | light grey (stone/metal) |
| 5 | 20–23 | `#403833` | dark brown |
| 6 | 24–27 | `#42464d` | slate grey (metal dark) |
| 7 | 28–31 | `#ecc5b2` | pale pink (skin/plaster) |
| 8 | 32–35 | `#d2a018` | gold/yellow |
| 9 | 36–39 | `#7fa26c` | sage green |
| 10 | 40–43 | `#d6946f` | terracotta light |
| 11 | 44–47 | `#8c7a5e` | khaki brown |
| 12 | 48–51 | `#99a52f` | grass/olive green |
| 13 | 52–55 | `#9a916f` | grey-tan |
| 14 | 56–59 | `#a3633c` | wood brown/terracotta |
| 15 | 60–63 | `#cf6a10` | orange |
| 16 | 64–67 | `#d63a20` | red-orange (vehicle red?) |
| 17 | 68–71 | `#fbe9e3` | off-white |
| 18 | 72–75 | `#eda04f` | amber |
| 19 | 76–79 | `#a51132` | crimson |
| 20 | 80–83 | `#a55ce4` | purple |
| 21 | 84–87 | `#de6590` | pink |
| 22 | 88–91 | `#1e0603` | near-black |
| 23 | 92–95 | `#fff2e8` | white |

`resources/theme1-backup/palette.png` is also 128x4 (original Bruno palette backup — diff against it to see which swatches the gold theme already changed).

**How UVs select pixels:** `sources/Game/Materials.js:36-44` — `createPalette()` builds a `MeshDefaultMaterial` with `colorNode: texture(this.game.resources.paletteTexture).rgb`, saved under the name `'palette'`. Meshes whose GLB material is named `palette` get this material via `Materials.updateObject()` (`Materials.js:356-366` → `getFromName(child.material.name, …)`). The mesh UVs were authored in Blender so every face's UV island sits inside one 4px swatch; sampling uses default `uv()` with `NearestFilter` / no mipmaps (`Game.js:107`). **Constraint: you cannot move a building's color to a different swatch without editing UVs (procedurally possible via gltf-transform/Node since node_modules has @gltf-transform/*), but recoloring a swatch in palette.png recolors everything mapped to it — that is the primary restyle lever.**

**png vs ktx at runtime:** `sources/Game/Game.js:97-107` — `const compressed = !!import.meta.env.VITE_COMPRESSED`; `.env` has `VITE_COMPRESSED=` (empty) → **the game loads `palette.png` (and `.glb`, `terrain.png`, etc.), NOT the .ktx/-compressed variants.** Just edit `static/palette.png` and you're done. If compression is ever enabled, regenerate via `npm run compress` (`scripts/compress.js`), which shells out to external `toktx` (palette preset at line ~93: `--encode uastc --genmipmap --assign_oetf srgb --target_type RGB`) and `gltf-transform` CLI — `toktx` is likely not installed; simplest is to keep `VITE_COMPRESSED` empty. The same script also converts `static/ui/**/*.png` → `.webp` (quality 80) with sharp (lines ~140-146) — **needed after editing map PNGs since the game loads the .webp**.

## (b) Scenery / world-structure inventory

`static/scenery/scenery.glb` (loaded uncompressed; materials: `palette`, `black`; 38 nodes): **no houses/buildings** — it contains: `refRoad` (the road ribbon, gets a procedural material), `slabes` (slabs), `bridgePhysicalFixed` + `.001` (2 bridges with cuboid colliders), `basaltRocksPhysicalStatic`..`.004` (5 basalt rock clusters with hull colliders), and ~14 anonymous `Cube.*` visual meshes (rocks/terrain dressing). World "architecture" actually lives in **`static/areas/areas.glb`** (737 nodes, 266 meshes), grouped per area root node: `landing` (giant letters `refLettersPhysicalDynamic.*`, sword, bonfire `refBonfire*`, kiosk `refKioskInteractivePoint`), `career` (6 `careerText`/`stone`/`refLine` milestones, `digit0` year), `social` (statues: `baguira`, `boy`, `sudo` w/ wings, platform + physical icons `discord/gitHub/linkedIn/mail/x/twitch/youtube/bluesky/onlyfans`), `projects` (forge: anvil, oven, blackboard, blower, grinder, medal, distinction trophies `awwwards/cssda/fwa`, image panels), `lab` (cauldron, chain pulley, gears, bowling-adjacent tables), `cookie` (stand with `refChimney`, `refBanner`, `refCounterPanel`, lava oven), `altar` (skull altar `refSkullEyes5`, counter), `toilet` (cabin `refCabinPhysicalDynamic`, moon door `refMoon`, paper rolls, stool), `bowling` (bar, couches, jukebox, pins `pin0-9`, sauce bottles, screen), `circuit` (road `refRoadPhysicalFixed`, rails, checkpoints, banners, air dancers, leaderboard, podium, starting lights), `behindTheScene` (light generators), `achievements` (pillar, waterfall `refWaterfall*`), `timeMachine` (TV `refScreen`, cups, stools). Materials in areas.glb: `palette` (dominant) + emissive gradients + baked-texture materials (`stylizedMap` — the in-world map prop, texture embedded in GLB; `careerText*`, `projectsCarpet`, `labCarpet`, `blackboardLabels`, `cookieBanner`, `circuitWebgl/Webgpu/Brand/Threejs`, `airDancer`, `waterfall`, `darkGray`). Trees/bushes/fences/benches/poleLights/lanterns/bricks/flowers are separate GLBs in `static/<name>/` instanced by `sources/Game/World/*.js`. Source .blend exists (`resources/folio-2025.blend`) but no Blender on machine.

## (c) Complete color-lever table (file:line → element → hex)

All paths relative to `B:\Ramim Profile Site\sources\Game\`.

**Sky / day-night cycle — `Cycles/DayCycles.js:5-8`** (each preset: revealColor, lightColor, shadowColor, fogColorA (sky zenith), fogColorB (sky horizon)):
- day L5: reveal `#5f7dff`, light `#ffd2c2`, shadow `#6d3fff`, fogA `#00ffff`, fogB `#9b89ff`
- dusk L6: reveal `#ff86d9`, light `#ff8181`, shadow `#4e009c`, fogA `#3e53ff`, fogB `#ff4ce4`
- night L7: reveal `#b678ff`, light `#3240ff`, shadow `#2f00db`, fogA `#10266f`, fogB `#490a42`
- dawn L8: reveal `#ff9d9d`, light `#ffa882`, shadow `#db004f`, fogA `#f885ff`, fogB `#ff7d24`

Fog/background (`Fog.js:10-11` `#ff0000`/`#0000ff` are placeholders — overwritten every tick from DayCycles at `Fog.js:45-46`; the sky IS the fog radial gradient, `scene.backgroundNode` at `Fog.js:18`). Tornado weather override: `Tornado.js:169-173` light `#ff4141`, shadow `#4e009c`, fogA `#3e53ff`, fogB `#ff4ce4`.

**Lighting — `Ligthing.js`** (note misspelled filename): L20 sun colorUniform `#ffffff` (driven by DayCycles lightColor), L89 bounceColor `#6f4a86` (global light-bounce tint), L88 shadowColor seeded from DayCycles.

**Terrain — `Terrain.js`**: height-gradient L46-48: `{0.1: #efa652}` (beach/sand), `{0.3: #4db4ae}` (shallow water teal), `{0.9: #0f2c50}` (deep water navy); L85 `grassColorUniform` `#a3ac33` (ground grass tint, mixed in colorNode L108-114). Terrain size = 192 world units (L13). Data texture `static/terrain/terrain.png`.

**Floor slabs — `World/Floor.js:47-48`**: slabHighColor `#efc98a`, slabLowColor `#9a7060`.

**Road — `World/Scenery.js:52`**: `#2c2833` (asphalt w/ glitter, intensity L55 `0.3`).

**Trees — `World/World.js:69-71`** (leaves colorA/colorB per species, used in `World/Trees.js:84-85`): Birch `#e85630`/`#ef9245`, Oak `#a2ad3b`/`#c6c542`, Cherry `#e96f84`/`#f5a1a4`.

**Bushes — `World/Bushes.js:12-13`**: `#a2ad3b` / `#c6c542`. **Falling leaves — `World/Leaves.js:97-98`**: `0x95513a` / `0xf56a3a`. **Grass blades — `World/Grass.js:132`**: inherits `terrain.colorNode` (so grassColorUniform above). **Flowers — `World/Flowers.js:122`**: baseColor `#ffffff` multiplied by per-instance colors sampled from flower reference models (palette-driven via `flowersReferences.glb`).

**Water — `World/WaterSurface.js:302`**: surface colorNode `0xffffff` (visual color comes from screen-refraction blur + terrain gradient teal/navy above; foam in `World/Areas/AchievementsArea.js:71` `#ffffff`). Underwater-object whitening: `Materials/MeshDefaultMaterial.js:95-96` `#ffffff`.

**Emissives (pole lights, lanterns, flames) — `Materials.js:27-33`**: `emissiveOrangeRadialGradient` `#ff8641`→`#ff3e00` (**pole lights use this**: `World/PoleLights.js:101`; lanterns likewise via material names), `emissivePurple` `#454bbc`→`#ff2eb4`, `emissiveBlue` `#91f0ff`→`#128fff`, `emissiveGreen` `#f8ffa6`→`#74ff00`, `emissiveWhite` `#ffffff`→`#666666`, `redGradient` `#ff3a3a`→`#721551`. Generic sky-reflection gradient `Materials.js:60-62`: `#f2c368`/`#d75f85`/`#0d0b3e`.

**Misc:** `Reveal.js:18` reveal beam `#e88eff` (overridden per-cycle); `Overlay.js:15-16` page overlay `#201c2c`/`#14111d`; `InteractivePoints.js:84-85` `#201c2c`/`#ffffff`; `World/Lightnings.js:29-30` `#ff4c00`/`#5180ff`; `World/VisualVehicle.js:143-144` boost `#ff9c20`/`#ff0000`, L189 fresnel `#6053ff`; `World/Confetti.js:28-30` `#ffbde7 #eeff95 #84ffb5`; `World/Grid.js:30-31,35` menu-void grid `#8d55ff`/`#675369` on `0x1b191f`; area-specific: `CareerArea.js:73-76` (`#5390ff #ff8039 #b65fff #a2ffab`), `CircuitArea.js:465,484,721,823` (`#32ffc1 #cbff62 #d684ff #463F35`), `CookieArea.js:174` & `LabArea.js:1192` flame mix `#ff3e00`→`#ff8641`, `LabArea.js:1207-08,1244-45`, `ProjectsArea.js:1264-68` (`#a88c7f`, `#ff8641`→`#ff3e00`), `AltarArea.js:25` `#ff544d`, `VisualTornado.js:58` `#ff544d`, `BehindTheSceneArea.js:54` `#6053ff`, `LandingArea.js:311` & `ProjectsArea.js:1227` & `LabArea.js:762,775` structural grey `0x6F6A87`.

## (d) UI map pipeline

- Loader: `sources/Game/Map.js:111` — swaps `ui/map/map-night.webp` / `ui/map/map-day.webp` based on the `night` day-cycle interval. **The .webp is what's displayed** (`static/ui/map/map-day.webp` etc.); regenerate webp from png via the sharp block at `scripts/compress.js:140-146` (`npm run compress`) or a one-liner.
- Projection: `Map.js:154-170` `worldToMap()` — `mapX = worldX/terrain.size + 0.5`, `mapY = worldZ/192 + 0.5`, clamped 0..1, applied as CSS `%`. So the **1024x1024 image spans world −96..+96 on X/Z, linearly, north-up (−Z = top)**. Player marker `static/ui/map/player.webp` (`map.styl:248`), rotated by vehicle yRotation (`Map.js:190`).
- Location pins: hardcoded list `Map.js:42-55` (12 respawn-anchored labels with per-pin % offsets); pin styling `sources/style/map.styl:284-321` (pin `#e9c68f` gold, border `#14111d`, label bg `rgba(20,17,29,0.92)`, border `rgba(233,198,143,0.45)`).
- `scripts/theme2-map.js` — existing generator for the current gold "Aurum Dusk" theme: takes **`resources/theme1-backup/map-day.png` / `map-night.png` (original Bruno renders, 1024x1024)** and applies sharp color-grading + an SVG overlay (frame, grid, ticks, compass, cartouche; `GOLD = '#e9c68f'`). A Bangladeshi map theme should follow the same pattern: regrade the theme1 backups, write png+webp into `static/ui/map/`.

## (e) Fonts & UI theme

- `static/fonts/`: Pally Regular/Medium/Bold/Variable (woff2/woff/ttf/eot); `sources/style/fonts.styl` has the three `@font-face` blocks (Latin only — Pally has no Bengali glyphs).
- Google Fonts via `sources/index.html:28`: `Amatic SC:700` (titles, `.title` in general.styl:64), `Nunito:400;700;900` (body), **and `Hind Siliguri:400;600;700` — a Bengali-capable font is ALREADY wired in**, with helper class `.bn` at `sources/style/general.styl:97` (`font-family "Hind Siliguri", "Nunito"`). To self-host instead: drop woff2 into `static/fonts/` + add `@font-face` in fonts.styl (trivial). Note in-world 3D text (`TextCanvas.js`, area labels) renders via canvas using CSS fonts, so Bengali in-world text works only where TextCanvas draws with a Bengali-capable family.
- Current gold-theme UI hexes: accent gold `#e9c68f` (general.styl:214-220, menu.styl:314, tooltips.styl:19,35-36, notifications.styl:52, map.styl:200,292); dark bg gradient `#201c2c`→`#14111d` (general.styl:49,288, menu.styl:144,191,205,289, notifications.styl:24, map.styl:84); crimson accent gradient `#8e1f3e`→`#1d1440` (menu.styl:40,357, map.styl:39,137); tooltip bg `#131019`; success green `#b9e896`; danger pink `#f26d84`; warn amber `#f0c27d` / `#eab876` (general.styl:82); neutral borders `#555555`/`#767676`/`#cccccc`; sub-panel `#1f1b29` (menu.styl:278). No central variable — hexes are repeated literally across the .styl files, so a restyle = find/replace per hex.

**Key constraints summary:** (1) palette.png edit is live immediately (VITE_COMPRESSED empty → png/glb loaded, no ktx regen needed); (2) per-object recolors within palette-mapped meshes require UV edits via @gltf-transform (available in node_modules) — no Blender; (3) map webp must be regenerated after png edits; (4) `stylizedMap`, carpets, banners, circuit logos are textures embedded inside `areas.glb` (editable only via gltf-transform texture swap); (5) Bengali font already loaded (Hind Siliguri + `.bn` class).