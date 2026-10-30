# Vehicle Recon + Rickshaw Replacement — B:\Ramim Profile Site

Generator: `scripts/build-rickshaw-glb.js` (Node, three.js geometry math + @gltf-transform writer + resvg art texture).
Dump/verify tool: `scripts/build-rickshaw-recon.js <glb>`.
Originals backed up in `resources/theme1-backup/vehicle/` (all 6 .glb).

## (1) Original default.glb skeleton (runtime-relevant)

Scene roots (traversal order matters — see regex note below):

```
chassis.001  t=[0,0.907,0]                         (t irrelevant: physics overwrites every tick)
├─ backLights        emissiveOrangeRadialGradient
├─ blinkerLeft.001 / blinkerRight.001              (front-mounted on the car; z<0 = LEFT side)
├─ bodyPainted.001   redGradient  (runtime-replaced by paint materials; has TEXCOORD_0+1)
├─ cell1..3.001      each { cellsCage (palette), cellsEnergy (emissivePurpleRadialGradient) }
├─ common            palette     (the car shell; ~3k verts)
├─ energy.001        darkGray    (boost battery; material.outputNode mixed w/ purple emissive)
├─ headlights.001    emissiveOrangeRadialGradient  (always-on glow; name NOT searched by code)
└─ stopLights.001    emissiveOrangeRadialGradient
wheelContainer.001  t=[0.872,-0.417,-0.699]        (cloned 4x by VisualVehicle)
├─ wheelCylinder.001 { wheel.006 (palette, r≈0.432, z ±0.27), wheelPainted (redGradient disc on -z face) }
├─ wheelGuard.001    palette
└─ wheelSuspension.002 t=[0,0.477,0]  (palette cylinder y 0..~1; runtime drives scale.y = |containerY|-0.5)
```

Original static-file bbox: min `[-1.399,-0.849,-0.968]` max `[1.592,1.627,0.943]` → size `[2.992,2.476,1.912]`.

### VisualVehicle.js contract (sources/Game/World/VisualVehicle.js)
- `setParts()` traverses the model matching `^(name)` case-insensitive for:
  `bodyPainted, chassis, blinkerLeft, blinkerRight, stopLights, backLights, wheelContainer, antenna, cell1, cell2, cell3, energy`.
  LAST traversed match wins → never name any node with a reserved prefix unintentionally.
- REQUIRED (crash if missing): `chassis`, `bodyPainted` (paints.changeTo), `wheelContainer` + a `wheelCylinder` descendant.
- Guarded/optional: blinkers (need BOTH if blinkerLeft exists), stopLights, backLights, antenna, energy (if present, cell1..3 required), wheelSuspension, wheelPainted.
- Wheels: container cloned 4x; physics indices: 0=(+0.90,+0.75) 1=(+0.90,-0.75) front/steer, 2=(-0.90,+0.75) 3=(-0.90,-0.75) rear; forward = +x; i=0,2 get `rotation.y=PI` (outward-facing mirror); cylinder spins on local z; container x/z snapped to physics basePosition every tick, y lerped (rest ≈ −0.88; ground ≈ −1.28 below chassis origin).
- Physics (PhysicsVehicle.js, UNCHANGED): wheel radius 0.4, offsets x ±0.90 / z ±0.75, chassis cuboids ~2.6×0.8×1.7 + bumper.
- Materials.updateObject(): mesh material replaced by `getFromName(material.name)` — `'palette'` → shared palette texture material (UV = point inside one 4px swatch of 128×4 palette.png); unknown names with a `map` pass through as textured MeshDefaultMaterial (this is how the art board works); `MeshDefaultMaterial` is FrontSide → open surfaces need doubled geometry.

### Antenna findings
- default.glb has NO antenna → `setAntenna()` returns early (guarded). The antenna feature is dormant.
- `defaultAntenna.glb` is LEGACY (older Blender export, referenced NOWHERE in sources; `antennaHead` root would even hijack `parts.antenna` via the `^(antenna)` regex and crash today's update()). Left untouched as a passthrough. The rickshaw deliberately ships no antenna; a decorative pennant flag is part of `common` instead (non-reserved name).
- KonamiCode.js needs NO changes: it reloads plain `vehicle/oldSchool.glb` / `vehicle/default.glb` (never `-compressed`), and `resourcesLoader.load` never overwrites `game.resources.vehicle`.

## (2) What was built (new default.glb)

Dhaka cycle-rickshaw per art-direction §3, same node skeleton:

```
chassis t=[0,0.907,0]
├─ bodyPainted  redGradient, TEXCOORD_0+1 (v=0 at top ⇒ gradient colorA at top; flames use uv1)
│    = kamani hood canopy (spherical section, pivot C=[-0.68,-0.30,0], R=0.78, fan 25°..160°,
│      side ±57° ⇒ z ±0.654, apex y≈0.48 ≈ 1.9 wu above ground) + valance ribbon
│      + passenger bench (x -1.04..-0.26, top y -0.55) + tilted backrest — all double-sided where open.
├─ common       palette (single merged mesh, per-part point-UVs — swatch map below)
│    frame swan-neck + head tube + seat tube + rear cradle tubes + axles, chrome handlebar/stem/bell,
│    grips, saddle, cranks/pedals/chainring/sprocket/chain runs, footboard + gold stripes,
│    bench skirt, rear apron + gold borders, art-board gold frame, side panels (sky) + gold bars +
│    magenta rosettes, 4 kamani bows + gold side rims, 7 gold valance scallops, hood medallion
│    (gold ring + magenta rose), 12 tassel cards (magenta/gold), pennant pole + green flag,
│    chrome headlamp housing.
├─ artBoard     material 'rickshawArt' (own embedded 256×144 PNG: peacock + flowers + gold border
│               on cobalt; source painting saved at resources/bd-theme/rickshaw-art-board.png).
│               Quad at x=-1.316, 0.62×0.36, facing −x (rear). Non-palette material passes through
│               Materials.createFromMaterial as a textured MeshDefaultMaterial.
├─ headlights   emissiveOrangeRadialGradient disc on the headlamp (always-on glow, like original)
├─ blinkerLeft/-Right  small lamps at rear apron corners (z ∓0.44) — game blinks them
├─ stopLights   twin discs on the apron rear face
├─ backLights   small bar above the art board (runtime swaps white/orange emissive)
├─ energy       darkGray battery box under the bench (boost purple-glow mix, as original)
└─ cell1..3     t=[0,0.2,0] each { cellsCage.00N (palette chrome, open cylinder, doubled),
                cellsEnergy.00N (emissivePurpleRadialGradient) } at [-0.50/-0.68/-0.86, -1.10, 0.50]
                — boost piston animation drives cellN.position.y 0.2→0.
wheelContainer t=[0.872,-0.417,-0.699]
├─ wheelCylinder { wheel (tire torus r0.40 tube 0.035 → outer 0.435 ≈ physics 0.4; chrome rim,
│                 8 spokes, hub), wheelPainted (r0.13 hub-cap discs BOTH faces, TEXCOORD_0+1) }
├─ wheelGuard   crimson mudguard (110° torus-arc ribbon R0.465 + 2 gold edge arcs) — steers with fork
└─ wheelSuspension t=[0,0.477,0] s=[1,0.38,1]  near-black strut (mesh y 0..0.97), original scale convention
```

New bbox: min `[-1.413,-0.848,-0.765]` max `[1.307,1.411,0.725]` → size `[2.72,2.258,1.49]`
vs original `[2.992,2.476,1.912]` → x −9.1%, y −8.8%, z −22% static (a rickshaw is narrower; RUNTIME
width is governed by the physics track: rear wheels ±0.75+0.05 → 1.60 vs original ~1.89, −15%).
Materials: palette (embeds current palette.png), redGradient, emissiveOrange/PurpleRadialGradient,
darkGray (factors copied from originals — names are the only thing the runtime uses), rickshawArt.
`default-compressed.glb` is a byte-identical copy. `oldSchool*.glb` untouched (Konami retro car intact).

### Swatch map (role-based; palette.png being repainted in parallel keeps roles)
| Swatch | current hex | rickshaw use |
|---|---|---|
| 22 near-black `#1e0603` | frame, fork strut, tires, saddle, grips, cranks, chain, kamani bows, footboard |
| 4 light grey `#c9c5c6` | rims/spokes/hubs, handlebar, bell, chainring, headlamp housing, cell cages, pennant pole |
| 19 crimson `#a51132` | mudguards, bench skirt, rear apron |
| 8 gold `#d2a018` | scallops, trims/borders, striping, art frame, medallion ring, gold tassels |
| 21 pink `#de6590` | medallion rose, side-panel rosettes, magenta tassels |
| 3 sky blue `#33a9d6` | side panels (peacock-blue role) |
| 9 sage green `#7fa26c` | pennant flag |

All palette UVs are single points at swatch centers `u=(idx+0.5)/32, v=0.5` (verified).

## (3) Code edits

`sources/Game/World/VisualVehicle.js` (only file edited; KonamiCode.js untouched):
1. `setWheels()`: `this.wheels.frontTrackPoint = new THREE.Vector3()`; hide clone `i===1` (`container.visible = false`).
2. `update()`: front containers centered — `position.z = i < 2 ? 0 : physicalWheel.basePosition.z`;
   ground tracks — i=1 forced `inContact=false` (no phantom marks), i=0 contact point shifted to the
   center line via `sideward * -offset.z` before `groundTrack.update()`.
Physics/handling identical (4 physics wheels unchanged); only the visuals show one steered front wheel.

## (4) Verification results
- Re-parse: all required node names present; no `antenna*`-prefixed hazard; material names exact. PASS
- Palette UVs at intended swatch centers (recon prints swatch ranges per mesh). PASS
- Art texture embedded (image[1] `rickshawArt`, 256×144 PNG). PASS
- bbox within ~15% on x/y (z narrower by design, see above).
- `node --check` on VisualVehicle.js + builder. PASS
- `npx gltf-transform inspect`: clean (no extensions, u16 indices, 16k render verts, 225 kB). PASS
- Not verified (no runtime here): actual WebGPU render — reviewer should confirm hood/paint gradient
  orientation (v=0=top ⇒ bright top) and tassel/scallop scale in-game.
