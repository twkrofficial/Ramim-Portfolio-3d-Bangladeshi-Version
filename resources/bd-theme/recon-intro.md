# Opening Intro Recon — Full Map

## Overview of the experience flow

The intro is **entirely WebGL/Three.js — there is no DOM loading screen**. The DOM (`sources/index.html`) contains no loader/title-screen markup; the "loader" is a 3D ring drawn in the scene, and the page background behind the canvas is a Stylus radial gradient. Sequence:

1. **Page load** — `html` background gradient `radial-gradient(farthest-side at 0 0, #201c2c, #14111d)` (`sources/style/general.styl:49`). `Game.init()` (`sources/Game/Game.js:70`) loads a small first batch (respawn refs, stars, `intro/sound`, palette), then constructs `World` step 0 which creates `Grid` + `Intro` (`sources/Game/World/World.js:49-53`).
2. **Loading phase** — a glowing **ring loader** at the spawn point fills clockwise as the second (big) resource batch loads: `Game.js:175-178` calls `this.world.intro.updateProgress(1 - toLoad / total)`. The dark **grid plane** (`Grid.js`) surrounds it; everything outside `reveal.distance` is discarded (hidden).
3. **Step 0** (`Reveal.updateStep(0)`, triggered at `Game.js:206-209` via `ticker.wait(3)` after all resources + Rapier resolve) — ring shrinks away (`Intro.circle.hide`, 1.5 s `power4.in`), reveal distance animates 0→3.5 (2 s `back.out(1.7)`), camera zoom 0.6→0.3 (1.25 s), then the **"CLICK TO START" label + sound toggle** appear as 3D planes (elastic pop-in, 2 s, delay 1 s). Waits for user input: click on a 3.5-radius sphere intersect, or `Enter/ArrowUp/ArrowDown/W/D/Gamepad.cross` (action `introStart`, `Reveal.js:139-145`).
4. **Step 1** (user clicked) — `audio.init()` + reveal whoosh `sounds/reveal/reveal-1.mp3`; reveal distance 3.5→30 (2 s `back.in(1.3)`) then snaps to 99999 (whole world visible); label hides (0.3 s); zoom→0 (1.75 s); input filter switches to `wandering` (car drivable).
5. **Step 2** — grid + intro destroyed, whispers created, `overlay.moveOnTop()`, server starts, `menu.preopen()`.

`#skip` in the URL hash auto-advances step 0→1 and 4×-speeds tweens (`Reveal.js:48,100`).

**The `Overlay` class is NOT shown at initial load** — its `progress` uniform starts at 0 (fully transparent/discarded). It is only used for later scene transitions (Player respawn `Player.js:471,486`; CircuitArea teleports). It still belongs to the intro *style family* (same dark-purple palette) and should be restyled together.

## (a) Inventory table

| Element | File(s) | Classes / functions | Current style |
|---|---|---|---|
| Page background (visible around canvas before render) | `sources/style/general.styl:48-49` | `html` rule | Radial gradient `#201c2c` → `#14111d` (dark purple/near-black), matches Overlay colors |
| Loader ring (3D) | `sources/Game/World/Intro.js:51-114` | `Intro.setCircle`, `Intro.updateProgress`, `Intro.update` (smoothing ×10/s) | `RingGeometry` radius 3.5, thickness 0.04, angular fill via TSL `atan` discard; color = `game.reveal.color × intensity` (day-cycle emissive, e.g. day `#5f7dff` int 12, night `#b678ff` int 10 — `DayCycles.js:5-8`), bloom via emissive intensity |
| Grid "void" floor | `sources/Game/World/Grid.js:25-89` | `Grid.setVisual`, `show`, `destroy` | 100×100 plane, base `#1b191f`, minor lines `#8d55ff` (10 units), major `#675369` (100 units); discarded inside `reveal.distance` |
| Reveal edge/circle | `sources/Game/Reveal.js` | `Reveal.updateStep(0/1/2)`, uniforms `distance`, `thickness` (0.05), `color`, `intensity`, `position2Uniform` | Glowing expanding circle boundary; color/intensity driven per-frame from `dayCycles.properties.revealColor/revealIntensity` (`Reveal.js:232-236`); consumed by `Grid.js:52-53` and materials (`hasReveal`) |
| "CLICK TO START" label | `sources/Game/World/Intro.js:23-49,116-200` | `setLabel`, `setText`, `showLabel`, `hideLabel` | 2×1 plane ×1.3, floating at y=3.3, tilted; white handwritten texture with arrow, alpha from `.r` channel; input-mode variants |
| Label textures | `static/intro/mouseKeyboardLabel.{png,ktx}`, `touchLabel`, `gamepadXboxLabel`, `gamepadPlaystationLabel` (256×128) | loaded in `Intro.setText` — **hardcoded `.ktx` + `textureKtx` loader** (`Intro.js:151-153`) regardless of `VITE_COMPRESSED` | White hand-drawn "CLICK TO START" + curved arrow on transparent bg |
| Sound toggle (3D button) | `sources/Game/World/Intro.js:202-259` | `setSoundButton`, rayCursor intersect, `audio.mute.toggle()` | `static/intro/sound.png/ktx` (100×40, two speaker icons side by side; `repeat.x=0.5`, `offset.x=0.5` when muted); white, brightens ×1.5 on hover |
| Overlay (transition wipe) | `sources/Game/Overlay.js` | `Overlay.show/hide/moveOnTop`; uniforms `progress`, `patternSize` (200×DPR), `strokeSize` (10), `inverted`; colors `colorA #201c2c`, `colorB #14111d` | Fullscreen quad, renderOrder 99; diagonal wipe (screenUV length, amplitude 0.5) through a repeating soft blob/cross alpha pattern (`static/overlay/overlayPattern.png`, 128×128, alpha remapped 0–0.68) + fine diagonal strokes; hash-noise-dithered gradient fill; swoosh sounds `Swoosh 02/05.mp3` |
| Cursor state during intro | `sources/style/general.styl:36-44` | `.input-filter-intro .experience` → `cursor: grab` | Set via `html.input-filter-{name}` classes from `Inputs.js:27-37` |
| Hidden UI during intro | `sources/style/menu.styl:19,45`, `map.styl:18,44` | `html.input-filter-intro &` | Menu/map trigger buttons hidden while filter is `intro` |
| Tab title animation | `sources/Game/Title.js` | `Title.update` — emoji car 🚗 driving past 🌳 in `document.title`, prefix "Ramim" (`Title.js:88`) | Starts at step ~1 (constructed `Game.js:197`); speed tied to `physicalVehicle.forwardSpeed` |
| Landing area (post-intro spawn) | `sources/Game/World/Areas/LandingArea.js` | `setLetters` (procedural TextGeometry "RAMIM AHMED", helvetiker_bold, palette material), `setKiosk`, `setControls`, `setBonfire` | Physics letter blocks revealed by expanding reveal circle at step 1; already personalized |
| Intro music/audio | `sources/Game/Audio.js:26-43,147-255`; `Reveal.js:21-27,151-153` | `audio.init()` called only at step 1 (user gesture); playlist (`Sudo/Boy/Baguira.mp3`) starts via jukebox/`VITE_MUSIC`, ambiances autoplay after init | No music before click; reveal whoosh on start; mute persisted state respected (`sound.png` offset) |
| Font preloaders | `sources/index.html:56-60`, `style/fonts.styl:29-46` | `.js-fonts-loader .fonts-loader` (Nunito, Amatic SC, Pally) | Offscreen divs; fonts loaded from Google Fonts + local Pally; `index.html:28` also loads Hind Siliguri (Bengali) already |

## (b) Exact hooks a redesign must touch

**Uniforms / shader values**
- `Overlay.js:15-19` — `colorA '#201c2c'`, `colorB '#14111d'`, `progress`, `patternSize = 200*DPR`, `strokeSize = 10`, `inverted`; pattern texture `game.resources.overlayPatternTexture` (`Game.js:160`, `static/overlay/overlayPattern.png|ktx`); alpha remap `0→0.68` at `Overlay.js:36`; diagonal `diagonalAmplitude 0.5` at line 21.
- `Reveal.js:18-19` — `color '#e88eff'` (overwritten every tick by `DayCycles.js:5-8` `revealColor`/`revealIntensity` — restyle there), `thickness 0.05`.
- `Grid.js:30-31,35` — line colors `#8d55ff`, `#675369`, base `0x1b191f`.
- `Intro.js:55-56` — ring radius 3.5 / thickness 0.04; ring color inherits `reveal.color`.
- `general.styl:49` — html background gradient (must match Overlay colors).

**Timings (gsap)**
- Ring hide: 1.5 s `power4.in` (`Intro.js:96-98`); label show: 2 s delay 1 s `elastic.out(0.5)` (`Intro.js:265-278`); label hide 0.3 s (`Intro.js:283-304`).
- Reveal step 0: distance→3.5, 2 s `back.out(1.7)`; zoom 0.6→0.3, 1.25 s (`Reveal.js:62-85`). Step 1: distance→30, 2 s `back.in(1.3)`; zoom→0, 1.75 s (`Reveal.js:156-195`).
- Trigger: `Game.js:206` `ticker.wait(3, () => reveal.updateStep(0))`; progress feed `Game.js:177`.
- Overlay show 2 s / hide 4 s `power1.inOut` (`Overlay.js:119,130`).

**Input / interaction hooks**
- Start action `introStart` keys list `Reveal.js:140`; click sphere radius 3.5 `Reveal.js:124-136`; hover `intensityMultiplier 1.22`.
- Sound button intersect sphere 0.5 (`Intro.js:236-251`).
- `html.input-filter-intro` CSS state class (Inputs.js:27).

**Assets (all swappable via sharp-generated PNG; note the .ktx caveat)**
- `static/intro/{mouseKeyboard,touch,gamepadXbox,gamepadPlaystation}Label.png` 256×128 — **but `Intro.js:151-153` hardcodes the `.ktx` path and `textureKtx` loader**, so either regenerate `.ktx` (needs `toktx`/gltf-transform toolchain, uncertain on this machine) or patch `Intro.js` to load `.png` when `!import.meta.env.VITE_COMPRESSED` (env `.env:4` is empty, so dev/prod currently uses PNG for everything else — patching is the safe route). Label shader reads the **red channel** as a mask (`.r.lessThan(0.5).discard`), so PNGs must have white art on black (or any r≥128) — alpha is ignored.
- `static/intro/sound.png` 100×40 (two-state sprite, left=on right=off; `repeat.x 0.5`) — loaded via the compressed-aware path (`Game.js:106`), PNG fine.
- `static/overlay/overlayPattern.png` 128×128 — **alpha channel** holds a soft radial blob/cross; replace alpha to change the wipe motif; keep `remap(0, 0.68, ...)` in mind (max alpha ~0.68·255 ≈ 173) or adjust the remap.

## (c) Restyle directions (ranked by achievability, no new binary-asset dependencies)

**1. "Sylhet dawn" recolor + Bengali labels (easiest, near-zero risk).** Pure value edits plus sharp-generated PNGs. Palette: swap the purple void for a deep tea-garden green/indigo night — e.g. html/Overlay `colorA #10261e` / `colorB #081410`, Grid base `#0d1f14`, grid lines rickshaw-art green `#1f7a4d` + gold `#c9a227`; DayCycles `revealColor`s toward marigold `#ffb347`, BD-flag red `#f42a41`, and green `#006a4e`. Regenerate the four 256×128 label PNGs with sharp+SVG: "চালু করতে ক্লিক করুন / CLICK TO START" in Hind Siliguri (already loaded in `index.html:28`; render white-on-black since only `.r` is read), plus a hand-drawn-style arrow path; patch `Intro.js:151-163` to use the plain `texture` loader + `.png` when not compressed. Redraw `sound.png` speakers in the same stroke style. Everything else (timings, geometry) untouched.

**2. Rickshaw-art medallion loader + shapla wipe (medium).** Builds on 1. Replace the plain ring with a decorated loader: keep the progress ring but add a second, thinner counter-rotating ring and scalloped border done procedurally in the ring's TSL `outputNode` (petal scallops = `sin(angle*N)` modulation of inner radius — no assets). Replace the Overlay pattern alpha with a sharp-generated **shapla (water lily) / paisley tile** (128×128 PNG alpha, soft-edged like the current blob) so scene transitions wipe through lotus motifs; bump `strokeSize` for bolder rickshaw-paint diagonals. Change `Title.js:43-48` emojis to a rickshaw theme (🛺 and 🌴/🍃) and prefix stays "Ramim".

**3. Full "cinema banner" opening (hardest, still asset-free).** Add a DOM title card: an absolutely-positioned div over the canvas during `input-filter-intro` (hook the existing `html.input-filter-intro` class; new styl file) showing "রামিম আহমেদ / RAMIM AHMED" in Amatic SC + Hind Siliguri with CSS-drawn rickshaw-art border (repeating-linear-gradient scallops), fading out when step 1 fires (listen where `Reveal.updateStep(1)` runs, or on the `introStart` input event). Combine with 1+2. Risk: must not intercept pointer events (the start click is a 3D raycast — set `pointer-events: none` except on decorative elements), and must handle the `#skip` path.

Key files for any direction: `sources/Game/Overlay.js`, `sources/Game/Reveal.js`, `sources/Game/World/Intro.js`, `sources/Game/World/Grid.js`, `sources/Game/Cycles/DayCycles.js` (lines 5-8), `sources/style/general.styl` (line 48-49), `sources/Game/Title.js`, `static/intro/*`, `static/overlay/overlayPattern.png`, and `sources/Game/Game.js` (lines 103-109, 160, 175-178, 206-209) for load wiring.