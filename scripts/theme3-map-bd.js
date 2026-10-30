/**
 * Theme 3 "Sonar Bangla" map generator — Bangladeshi rickshaw-art restyle.
 *
 * Rebuilds static/ui/map/map-day.(png|webp) and map-night.(png|webp) from the
 * original theme-1 terrain renders (resources/theme1-backup/), following
 * resources/bd-theme/art-direction.md §4:
 *   - gradient-maps the terrain toward the Sonar Bangla greens (underpainting)
 *   - detects water + asphalt masks from the base render pixels and repaints
 *     them as enamel shapes: peacock-blue rivers with fish-scale waves, ink
 *     outlines, cream sandbank stipple; dark bitumen circuit with enamel
 *     red/cream curbs
 *   - composites a hand-built SVG overlay: three-band jhalot/terracotta/kantha
 *     border, painted-flower compass rose (উ/দ/পূ/প), Galada cartouche,
 *     bilingual scalloped nameplates, kantha-stitch routes, zone blobs,
 *     corner alpana, vignettes (tea rows, dome, nouka, kantha fish)
 *   - night variant: multiplied terrain, navy water + moon glint, lantern
 *     glow dots, marigold route glow (border/cartouche/compass unchanged)
 * Also restyles the player marker (top-down rickshaw) and writes previews to
 * resources/bd-theme/.
 *
 * Bengali text is shaped by pango/librsvg inside sharp — the repo-local
 * fontconfig (resources/bd-theme/fontconfig) MUST be set before sharp loads,
 * hence the dynamic import below. (resvg-js 2.6 was tested and mis-shapes
 * Bengali vowel reordering, so it is not used.)
 *
 * Usage: node scripts/theme3-map-bd.js
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.env.FONTCONFIG_PATH = path.join(ROOT, 'resources', 'bd-theme', 'fontconfig')
process.env.FONTCONFIG_FILE = path.join(ROOT, 'resources', 'bd-theme', 'fontconfig', 'fonts.conf')

const sharp = (await import('sharp')).default

const SIZE = 1024
const N = SIZE

// ---------------------------------------------------------------------------
// Palette (art-direction.md §4)
// ---------------------------------------------------------------------------
const P = {
    groundDark: '#12332B',
    panelRed:   '#C8102E',
    darkRed:    '#8E1B1B',
    marigold:   '#F5A800',
    leafGreen:  '#2E9E4F',
    leafFluo:   '#4CCB5F',
    peacock:    '#1467B3',
    skyTeal:    '#3BB3C3',
    shaplaPink: '#E86A9E',
    cream:      '#F6EAD2',
    alpana:     '#FFF9EF',
    ink:        '#20160F',
    nightWater: '#1C2B45',
    nightMult:  '#233252',
    lantern:    '#FF9E3D',
    bitumen:    '#3A342A',
    highGreen:  '#7CB342',
}

const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const lerp = (a, b, t) => a + (b - a) * t

// Deterministic PRNG (mulberry32)
const mulberry32 = (seed) => () =>
{
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
}

// ---------------------------------------------------------------------------
// Pin positions (from static/respawns/respawnsReferences.glb via
// mapPx = (world / 192 + 0.5) * 1024, north-up)
// ---------------------------------------------------------------------------
const PIN = {
    cookie: [595, 706], landing: [723, 714], altar: [911, 437], projects: [703, 606],
    lab: [607, 612], career: [652, 563], social: [649, 435], toilet: [890, 864],
    bowling: [626, 844], circuit: [439, 590], timeMachine: [211, 167],
    behindTheScene: [772, 451], achievements: [885, 621], bonfire: [806, 747], bridge: [791, 652],
}

// Bilingual labels (Bangla first — spellings from research-map-typography.md §3).
// Plate centres are offset away from the exact DOM pin points (hover labels pop
// up above pins, so plates mostly sit below/beside them).
const LABELS = [
    { bn: 'প্রকল্প',        en: 'PROJECTS',   x: 762, y: 648, tint: P.shaplaPink, zone: { cx: 703, cy: 606, rx: 64, ry: 50, seed: 11 } },
    { bn: 'গবেষণাগার',     en: 'LAB',        x: 536, y: 662, tint: P.skyTeal,    zone: { cx: 607, cy: 612, rx: 48, ry: 40, seed: 12 } },
    { bn: 'কর্মজীবন',      en: 'CAREER',     x: 640, y: 515, tint: P.marigold,   zone: { cx: 652, cy: 563, rx: 54, ry: 42, seed: 13 } },
    { bn: 'যোগাযোগ',       en: 'CONTACT',    x: 649, y: 386, tint: P.peacock,    zone: { cx: 649, cy: 435, rx: 60, ry: 46, seed: 14 } },
    { bn: 'আমার সম্পর্কে', en: 'ABOUT',      x: 818, y: 497, tint: P.marigold,   zone: { cx: 772, cy: 451, rx: 52, ry: 40, seed: 15 } },
    { bn: 'বাড়ি',           en: 'HOME',       x: 772, y: 770, tint: P.leafFluo,   zone: { cx: 723, cy: 714, rx: 62, ry: 48, seed: 16 } },
    { bn: 'খেলাঘর',        en: 'PLAYGROUND', x: 626, y: 800, tint: P.peacock,    zone: { cx: 626, cy: 848, rx: 70, ry: 42, seed: 17 } },
    { bn: 'সিলেট',          en: 'SYLHET',     x: 165, y: 300, tint: null },
    { bn: 'চা-বাগান',       en: 'TEA GARDEN', x: 790, y: 293, tint: null },
]

// Kantha-stitch footpath routes between areas (drawn with hand wobble)
const ROUTES = [
    [PIN.social, PIN.career, PIN.projects, PIN.landing],
    [PIN.career, PIN.lab, [455, 592]],
    [PIN.landing, PIN.cookie, PIN.bowling],
    [PIN.social, PIN.behindTheScene, [893, 440]],
    [PIN.landing, PIN.bridge, [873, 624]],
    [PIN.landing, [780, 737], PIN.bonfire, [878, 845]],
]

const LANTERNS = [
    PIN.landing, PIN.cookie, PIN.projects, PIN.career, PIN.lab, PIN.social,
    PIN.behindTheScene, PIN.bowling, PIN.altar, PIN.achievements, PIN.toilet,
    PIN.timeMachine, PIN.bonfire,
]

// ---------------------------------------------------------------------------
// Mask helpers (Uint8Array of N*N, 0 / 255)
// ---------------------------------------------------------------------------
const morph1D = (src, radius, horizontal, isMax) =>
{
    const dst = new Uint8Array(N * N)
    for(let a = 0; a < N; a++)
    {
        for(let b = 0; b < N; b++)
        {
            let v = isMax ? 0 : 255
            for(let d = -radius; d <= radius; d++)
            {
                const c = b + d
                if(c < 0 || c >= N) { if(!isMax) v = Math.min(v, 0); continue }
                const s = horizontal ? src[a * N + c] : src[c * N + a]
                v = isMax ? Math.max(v, s) : Math.min(v, s)
            }
            if(horizontal) dst[a * N + b] = v
            else dst[b * N + a] = v
        }
    }
    return dst
}
const dilate = (m, r) => morph1D(morph1D(m, r, true, true), r, false, true)
const erode = (m, r) => morph1D(morph1D(m, r, true, false), r, false, false)
const maskAndNot = (a, b) =>
{
    const out = new Uint8Array(N * N)
    for(let i = 0; i < N * N; i++) out[i] = a[i] && !b[i] ? 255 : 0
    return out
}

const computeMasks = (data, C) =>
{
    const waterRaw = new Uint8Array(N * N)
    const roadRaw = new Uint8Array(N * N)
    for(let i = 0; i < N * N; i++)
    {
        const o = i * C
        const r = data[o], g = data[o + 1], b = data[o + 2]
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        // teal/navy water + a looser rule for the vignette-darkened ocean corners
        if((b - r > 22 && b - g < 70) || (b - r > 12 && b - g < 40 && b > g && lum < 80)) waterRaw[i] = 255
        else if(r - g >= 4 && r - g <= 28 && g - b >= 10 && g - b <= 34 && r >= 55 && r <= 125) roadRaw[i] = 255
    }

    let water = dilate(erode(waterRaw, 2), 2)   // open: kill blue prop specks
    water = erode(dilate(water, 2), 2)          // close: smooth banks
    let road = dilate(erode(roadRaw, 2), 2)
    road = erode(dilate(road, 3), 3)
    road = maskAndNot(road, water)

    return {
        water,
        road,
        waterEdge: maskAndNot(dilate(water, 2), erode(water, 1)),
        roadEdge: maskAndNot(dilate(road, 2), erode(road, 1)),
        stippleRing: maskAndNot(erode(water, 5), erode(water, 9)),
        waterInner: erode(water, 3),
        curbZone: maskAndNot(dilate(road, 12), road),
        land: maskAndNot(maskAndNot(new Uint8Array(N * N).fill(255), dilate(water, 2)), dilate(road, 2)),
    }
}

// ---------------------------------------------------------------------------
// Terrain pass: gradient map + water/road repaint + ink edges + grain
// ---------------------------------------------------------------------------
const paintTerrain = (data, C, masks, variant) =>
{
    const night = variant === 'night'
    const shadow = hex2rgb(P.groundDark), mid = hex2rgb(P.leafGreen), high = hex2rgb(P.highGreen)
    const ink = hex2rgb(P.ink), cream = hex2rgb(P.cream)
    const red = hex2rgb(P.panelRed), bitumen = hex2rgb(P.bitumen)
    const waterDay = hex2rgb(P.peacock), waterNight = hex2rgb(P.nightWater)
    const mult = hex2rgb(P.nightMult).map(v => v / 255)

    // luminance -> Sonar Bangla green ramp LUT
    const lut = []
    for(let v = 0; v < 256; v++)
    {
        const t = v / 255
        lut.push(t <= 0.5
            ? [0, 1, 2].map(k => lerp(shadow[k], mid[k], t * 2))
            : [0, 1, 2].map(k => lerp(mid[k], high[k], (t - 0.5) * 2)))
    }

    const rand = mulberry32(20260730)
    const out = Buffer.alloc(N * N * 3)
    for(let i = 0; i < N * N; i++)
    {
        const o = i * C
        const r = data[o], g = data[o + 1], b = data[o + 2]
        const lum = Math.min(255, Math.round(0.299 * r + 0.587 * g + 0.114 * b))
        const t = lum / 255
        let c

        if(masks.waterEdge[i] || masks.roadEdge[i])
            c = [...ink]
        else if(masks.water[i])
        {
            const base = night ? waterNight : waterDay
            const m = 0.82 + 0.32 * t // keep some depth variation from the render
            c = base.map(v => v * m)
        }
        else if(masks.road[i])
            c = bitumen.map(v => v * (0.9 + 0.25 * t))
        else
        {
            // enamel curbs: red/white pixels hugging the circuit
            if(masks.curbZone[i] && r > 140 && g < 95 && b < 95) c = [...red]
            else if(masks.curbZone[i] && r > 178 && g > 178 && b > 178) c = [...cream]
            else
            {
                const gm = lut[lum]
                c = [gm[0] * 0.78 + r * 0.22, gm[1] * 0.78 + g * 0.22, gm[2] * 0.78 + b * 0.22]
            }
            if(night) c = c.map((v, k) => v * (0.45 + 0.55 * mult[k]))
        }

        // cream sandbank stipple just inside banks (dimmer at night)
        if(masks.stippleRing[i])
        {
            const x = i % N, y = (i / N) | 0
            if(x % 8 >= 3 && x % 8 <= 4 && y % 8 >= 3 && y % 8 <= 4)
                c = c.map((v, k) => v * 0.2 + cream[k] * 0.8 * (night ? 0.75 : 1))
        }

        // 3% enamel grain
        const jit = 1 + (rand() - 0.5) * 0.06
        out[i * 3] = Math.max(0, Math.min(255, c[0] * jit))
        out[i * 3 + 1] = Math.max(0, Math.min(255, c[1] * jit))
        out[i * 3 + 2] = Math.max(0, Math.min(255, c[2] * jit))
    }
    return out
}

// ---------------------------------------------------------------------------
// Raster layers masked by pixel masks
// ---------------------------------------------------------------------------
const maskedSvgLayer = async (svg, mask, alphaScale = 1) =>
{
    const { data } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    for(let i = 0; i < N * N; i++)
        data[i * 4 + 3] = Math.round(data[i * 4 + 3] * (mask[i] / 255) * alphaScale)
    return { input: data, raw: { width: N, height: N, channels: 4 }, left: 0, top: 0 }
}

// Fish-scale wave pattern (lohori kantha), clipped to water
const fishScaleSvg = () =>
{
    let rows = ''
    for(let j = 0; j < N / 16 + 1; j++)
    {
        const y = j * 16 + 8
        const x0 = (j % 2) ? -20 : 0
        let d = `M ${x0} ${y}`
        for(let k = 0; k < N / 40 + 2; k++) d += ` q 10 -8 20 0 q 10 8 20 0`
        rows += `<path d="${d}" fill="none" stroke="${P.skyTeal}" stroke-width="2"/>`
    }
    return `<svg width="${N}" height="${N}" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`
}

// 5%-opacity kalka/paisley tile over the land
const kalkaSvg = () =>
{
    const kalka = `<path d="M 0 10 C 12 -6 6 -22 -4 -16 C -12 -11 -8 0 0 10 Z M -1 4 C -7 -2 -8 -9 -4 -12" fill="none" stroke="${P.cream}" stroke-width="1.6" stroke-linecap="round"/>`
    let uses = ''
    for(let j = 0; j < N / 44 + 1; j++)
        for(let k = 0; k < N / 44 + 1; k++)
        {
            const x = k * 44 + ((j % 2) ? 22 : 0)
            const y = j * 44
            uses += `<g transform="translate(${x} ${y}) rotate(${(j + k) % 2 ? 18 : -12})">${kalka}</g>`
        }
    return `<svg width="${N}" height="${N}" xmlns="http://www.w3.org/2000/svg">${uses}</svg>`
}

// ---------------------------------------------------------------------------
// Text measurement (pango via sharp, trimmed bbox)
// ---------------------------------------------------------------------------
const measureText = async (str, family, weight, size, spacing = 0) =>
{
    const svg = `<svg width="1400" height="300" xmlns="http://www.w3.org/2000/svg">
        <text x="60" y="180" font-family="${family}" font-weight="${weight}" font-size="${size}"
            ${spacing ? `letter-spacing="${spacing}"` : ''} fill="#000">${str}</text></svg>`
    const { info } = await sharp(Buffer.from(svg)).trim().png().toBuffer({ resolveWithObject: true })
    return { w: info.width, h: info.height }
}

// ---------------------------------------------------------------------------
// SVG geometry helpers
// ---------------------------------------------------------------------------

// smooth open polyline with hand wobble (kantha routes)
const wobblePath = (pts, seed, amp = 2.6) =>
{
    const rand = mulberry32(seed)
    const res = []
    for(let s = 0; s < pts.length - 1; s++)
    {
        const [x0, y0] = pts[s], [x1, y1] = pts[s + 1]
        const len = Math.hypot(x1 - x0, y1 - y0)
        const steps = Math.max(2, Math.round(len / 34))
        for(let k = 0; k < steps; k++)
        {
            const t = k / steps
            const x = lerp(x0, x1, t), y = lerp(y0, y1, t)
            const nx = -(y1 - y0) / len, ny = (x1 - x0) / len
            const off = (s === 0 && k === 0) ? 0 : (rand() - 0.5) * 2 * amp
            res.push([x + nx * off, y + ny * off])
        }
    }
    res.push(pts[pts.length - 1])
    let d = `M ${res[0][0].toFixed(1)} ${res[0][1].toFixed(1)}`
    for(let i = 1; i < res.length - 1; i++)
    {
        const mx = (res[i][0] + res[i + 1][0]) / 2, my = (res[i][1] + res[i + 1][1]) / 2
        d += ` Q ${res[i][0].toFixed(1)} ${res[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
    }
    const last = res[res.length - 1]
    d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`
    return d
}

// closed organic blob
const blobPath = (cx, cy, rx, ry, seed, points = 12) =>
{
    const rand = mulberry32(seed)
    const pts = []
    for(let k = 0; k < points; k++)
    {
        const a = (k / points) * Math.PI * 2
        const m = 0.78 + rand() * 0.4
        pts.push([cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m])
    }
    let d = ''
    for(let k = 0; k < points; k++)
    {
        const p = pts[k], q = pts[(k + 1) % points]
        const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2
        if(k === 0)
        {
            const p0 = pts[points - 1]
            d = `M ${((p0[0] + p[0]) / 2).toFixed(1)} ${((p0[1] + p[1]) / 2).toFixed(1)}`
        }
        d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
    }
    return d + ' Z'
}

// plate/cartouche panel: rounded top, scalloped bottom edge
const scallopPanel = (x, y, w, h, r = 8, sc = 6) =>
{
    const nSc = Math.max(2, Math.round(w / (sc * 2)))
    const scW = w / nSc
    let d = `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h}`
    for(let k = 0; k < nSc; k++) d += ` a ${scW / 2} ${sc} 0 0 1 ${-scW} 0`
    d += ` L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`
    return d
}

// ---------------------------------------------------------------------------
// Overlay components
// ---------------------------------------------------------------------------

// Band A + B + C for the top edge; reused via rotation for the other 3 edges
const borderEdge = () =>
{
    let s = ''
    // Band A ground + offset dark-red scallop row
    s += `<rect x="0" y="0" width="${N}" height="40" fill="${P.darkRed}"/>`
    for(let k = 0; k <= N / 48; k++)
        s += `<circle cx="${k * 48}" cy="10" r="26" fill="${P.darkRed}" stroke="${P.ink}" stroke-width="2"/>`
    // main jhalot scallops (panel-red, ink stroke, marigold dot)
    for(let k = 0; k <= N / 48; k++)
        s += `<circle cx="${24 + k * 48}" cy="14" r="24" fill="${P.panelRed}" stroke="${P.ink}" stroke-width="2.6"/>`
    s += `<rect x="0" y="0" width="${N}" height="15" fill="${P.panelRed}"/>`
    for(let k = 0; k <= N / 48; k++)
        s += `<circle cx="${24 + k * 48}" cy="22" r="5" fill="${P.marigold}" stroke="${P.ink}" stroke-width="1.4"/>`

    // Band B — terracotta frieze (cream band, dark-red stroked lotus/kalka tiles)
    s += `<rect x="0" y="40" width="${N}" height="28" fill="${P.cream}"/>`
    s += `<line x1="0" y1="41.5" x2="${N}" y2="41.5" stroke="${P.ink}" stroke-width="2"/>`
    s += `<line x1="0" y1="66.5" x2="${N}" y2="66.5" stroke="${P.ink}" stroke-width="2"/>`
    const lotusPetal = 'M 0 0 Q 4 -5.5 0 -11 Q -4 -5.5 0 0'
    for(let k = 0; k <= N / 56; k++)
    {
        const cx = 28 + k * 56
        if(k % 2 === 0)
        {
            s += `<g transform="translate(${cx} 54)">`
            for(let p = 0; p < 8; p++) s += `<path d="${lotusPetal}" transform="rotate(${p * 45})" fill="none" stroke="${P.darkRed}" stroke-width="2"/>`
            s += `<circle r="2.4" fill="${P.darkRed}"/></g>`
        }
        else
            s += `<g transform="translate(${cx} 56)"><path d="M 0 8 C 11 -5 5.5 -19 -3.5 -14 C -10.5 -9.5 -7 0 0 8 Z" fill="none" stroke="${P.darkRed}" stroke-width="2"/>
                <path d="M -1 2.5 C -6 -2.5 -7 -8.5 -3.5 -11" fill="none" stroke="${P.darkRed}" stroke-width="1.5"/><circle cx="1.5" cy="-17" r="1.8" fill="${P.darkRed}"/></g>`
        // small diamond connector between tiles
        s += `<path d="M ${cx + 28} 51 L ${cx + 31} 54 L ${cx + 28} 57 L ${cx + 25} 54 Z" fill="${P.darkRed}" opacity="0.85"/>`
    }

    // Band C — kantha running stitch on a low sine
    const sine = (y0) =>
    {
        let d = `M 0 ${y0}`
        for(let k = 0; k < N / 56 + 1; k++) d += ` q 14 2.6 28 0 q 14 -2.6 28 0`
        return d
    }
    s += `<path d="${sine(78)}" fill="none" stroke="${P.marigold}" stroke-width="2.5" stroke-dasharray="7 5" stroke-linecap="round"/>`
    s += `<path d="${sine(86)}" fill="none" stroke="${P.marigold}" stroke-width="2.5" stroke-dasharray="7 5" stroke-dashoffset="6" stroke-linecap="round"/>`
    return s
}

// quarter-flower rosette turning a border corner (drawn for the TL corner)
const cornerRosette = () =>
{
    let s = `<g>`
    s += `<path d="M 0 0 L 60 0 A 60 60 0 0 1 0 60 Z" fill="${P.darkRed}" stroke="${P.ink}" stroke-width="2.5"/>`
    for(const a of [11, 30.5, 50, 69.5])
        s += `<path d="M 0 0 Q 9 -16 0 -52 Q -9 -16 0 0" transform="rotate(${90 + a})" fill="${P.panelRed}" stroke="${P.ink}" stroke-width="2"/>`
    for(const a of [11, 30.5, 50, 69.5])
        s += `<path d="M 0 0 Q 5 -11 0 -32 Q -5 -11 0 0" transform="rotate(${90 + a})" fill="${P.marigold}" stroke="none"/>`
    s += `<path d="M 0 0 L 20 0 A 20 20 0 0 1 0 20 Z" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2"/>`
    s += `<circle cx="8.5" cy="8.5" r="3.4" fill="${P.cream}"/>`
    // little lotus filling the cream band-B corner square beyond the disc
    s += `<g transform="translate(62 62) rotate(45)">`
    for(let p = 0; p < 8; p++) s += `<path d="M 0 0 Q 3.4 -5 0 -10 Q -3.4 -5 0 0" transform="rotate(${p * 45})" fill="none" stroke="${P.darkRed}" stroke-width="1.8"/>`
    s += `<circle r="2" fill="${P.darkRed}"/></g>`
    return s + '</g>'
}

// white-on-dark quarter-radial alpana at the content corners (drawn for TL)
const cornerAlpana = () =>
{
    const c = P.alpana
    let s = `<g fill="none" stroke="${c}" stroke-linecap="round" opacity="0.85">`
    s += `<path d="M 96 20 A 76 76 0 0 1 20 96" stroke-width="2"/>`
    s += `<path d="M 82 20 A 62 62 0 0 1 20 82" stroke-width="1.6" stroke-dasharray="1 7"/>`
    s += `<path d="M 66 20 A 46 46 0 0 1 20 66" stroke-width="2"/>`
    for(const a of [15, 45, 75])
        s += `<g transform="translate(20 20) rotate(${a})"><path d="M 0 0 Q 5 -18 0 -38 Q -5 -18 0 0" stroke-width="1.8"/></g>`
    for(const a of [30, 60])
        s += `<g transform="translate(20 20) rotate(${a})"><circle cx="0" cy="-52" r="2.4" fill="${c}" stroke="none"/></g>`
    s += `<g transform="translate(20 20) rotate(45)"><path d="M 0 -62 C 8 -74 4 -84 -2 -80 C -8 -76 -5 -68 0 -62 Z" stroke-width="1.8"/></g>`
    return s + '</g>'
}

// painted-flower compass rose (§4.4)
const compassRose = (cx, cy) =>
{
    let s = `<g transform="translate(${cx} ${cy})">`
    // peacock ring with cream dot chain
    s += `<circle r="76" fill="none" stroke="${P.ink}" stroke-width="18"/>`
    s += `<circle r="76" fill="none" stroke="${P.peacock}" stroke-width="14"/>`
    for(let k = 0; k < 20; k++)
    {
        const a = (k / 20) * Math.PI * 2
        s += `<circle cx="${(Math.cos(a) * 76).toFixed(1)}" cy="${(Math.sin(a) * 76).toFixed(1)}" r="2.4" fill="${P.cream}"/>`
    }
    // intercardinal leaves
    for(const a of [45, 135, 225, 315])
        s += `<g transform="rotate(${a})"><path d="M 0 -52 C 9 -36 9 -20 0 -14 C -9 -20 -9 -36 0 -52 Z" fill="${P.leafGreen}" stroke="${P.ink}" stroke-width="2.2"/>
            <path d="M 0 -46 L 0 -18" stroke="${P.cream}" stroke-width="1.4" fill="none"/></g>`
    // cardinal lotus-petal blades (N larger) + marigold echo
    for(const [a, L] of [[0, 68], [90, 60], [180, 60], [270, 60]])
    {
        s += `<g transform="rotate(${a})"><path d="M 0 ${-L} C 11 ${-L + 26} 11 -16 0 -11 C -11 -16 -11 ${-L + 26} 0 ${-L} Z" fill="${P.panelRed}" stroke="${P.ink}" stroke-width="2.4"/>
            <path d="M 0 ${-L + 10} C 6 ${-L + 26} 6 -18 0 -14 C -6 -18 -6 ${-L + 26} 0 ${-L + 10} Z" fill="${P.marigold}" stroke="none"/></g>`
    }
    // shapla-pink 8-petal centre + marigold dot
    for(let p = 0; p < 8; p++)
        s += `<path d="M 0 0 Q 6.5 -10 0 -21 Q -6.5 -10 0 0" transform="rotate(${p * 45 + 22.5})" fill="${P.shaplaPink}" stroke="${P.ink}" stroke-width="1.8"/>`
    s += `<circle r="6.5" fill="${P.marigold}" stroke="${P.ink}" stroke-width="1.8"/>`
    // Bengali cardinal letters on the ring
    const letters = [['উ', 0, -76], ['দ', 0, 76], ['পূ', 76, 0], ['প', -76, 0]]
    for(const [ch, lx, ly] of letters)
        s += `<text x="${lx}" y="${ly + 6}" text-anchor="middle" font-family="Baloo Da 2" font-weight="700" font-size="17"
            fill="${P.cream}" stroke="${P.ink}" stroke-width="3" paint-order="stroke" stroke-linejoin="round">${ch}</text>`
    return s + '</g>'
}

// shankhalata vine (cartouche flank), drawn growing to the left from (0,0)
const vine = () =>
{
    let s = `<g fill="none" stroke="${P.cream}" stroke-width="2.4" stroke-linecap="round">`
    s += `<path d="M 0 0 q -18 -13 -36 0 q -18 13 -36 0 q -18 -13 -36 0"/>`
    for(const [x, y, up] of [[-18, -8, 1], [-54, 8, -1], [-90, -8, 1]])
        s += `<path d="M ${x} ${y} q ${-6} ${up * -8} -14 ${up * -5}" stroke-width="2"/>`
    for(const [x, y] of [[-36, 0], [-72, 0]])
        s += `<circle cx="${x}" cy="${y}" r="2.2" fill="${P.cream}" stroke="none"/>`
    // lotus bud terminal
    s += `<g transform="translate(-112 0)"><path d="M 0 0 Q 3 -8 0 -14 Q -3 -8 0 0 Z" fill="${P.cream}" stroke="none" transform="rotate(-90)"/>
        <path d="M 0 0 Q 5 -6 12 -6 M 0 0 Q 5 6 12 6" stroke-width="2"/></g>`
    return s + '</g>'
}

// little dove perched on the cartouche (facing right)
const dove = () =>
    `<g><path d="M 0 0 C -10 -2 -14 -10 -10 -16 C -6 -21 2 -21 6 -16 C 8 -19 12 -19 14 -16 L 20 -14 L 13 -11 C 13 -5 8 0 0 0 Z"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M -4 -14 C -8 -11 -8 -6 -3 -4" fill="none" stroke="${P.ink}" stroke-width="1.2"/>
    <circle cx="9" cy="-16.2" r="0.9" fill="${P.ink}"/></g>`

// title cartouche (§4 cartouche spec)
const cartouche = (nameW) =>
{
    const w = Math.max(392, nameW + 96)
    const x = (N - w) / 2, y = 96, h = 118
    let s = '<g>'
    // flanking vines + doves
    s += `<g transform="translate(${x - 6} 152)">${vine()}</g>`
    s += `<g transform="translate(${x + w + 6} 152) scale(-1 1)">${vine()}</g>`
    // layered panel: dark-red drop, panel-red face, marigold pinline
    s += `<path d="${scallopPanel(x + 4, y + 5, w, h, 10, 9)}" fill="${P.darkRed}" stroke="${P.ink}" stroke-width="2"/>`
    s += `<path d="${scallopPanel(x, y, w, h, 10, 9)}" fill="${P.panelRed}" stroke="${P.ink}" stroke-width="3"/>`
    s += `<rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 22}" fill="none" stroke="${P.marigold}" stroke-width="1.6" opacity="0.9"/>`
    // twin doves perched on the top corners of the panel
    s += `<g transform="translate(${x + 40} ${y + 3})">${dove()}</g>`
    s += `<g transform="translate(${x + w - 40} ${y + 3}) scale(-1 1)">${dove()}</g>`
    // text: মানচিত্র / রামিম আহমেদ (Galada, marigold under-copy) / RAMIM AHMED
    s += `<text x="${N / 2}" y="${y + 30}" text-anchor="middle" font-family="Baloo Da 2" font-weight="600" font-size="19" fill="${P.cream}">মানচিত্র</text>`
    s += `<text x="${N / 2 + 2}" y="${y + 76}" text-anchor="middle" font-family="Galada" font-size="44" fill="${P.marigold}">রামিম আহমেদ</text>`
    s += `<text x="${N / 2}" y="${y + 74}" text-anchor="middle" font-family="Galada" font-size="44" fill="${P.cream}">রামিম আহমেদ</text>`
    s += `<text x="${N / 2 + 3}" y="${y + 101}" text-anchor="middle" font-family="Baloo Da 2" font-weight="700" font-size="14" letter-spacing="6" fill="${P.marigold}">RAMIM AHMED</text>`
    return s + '</g>'
}

// bilingual scalloped nameplate
const namePlate = (label, dims) =>
{
    const w = Math.max(dims.bn.w, dims.en.w) + 34
    const h = 52
    const x = label.x - w / 2, y = label.y - h / 2
    const rot = ((label.seedRot ?? label.x) % 5) - 2 // -2..2 deg hand tilt
    let s = `<g transform="rotate(${rot * 0.8} ${label.x} ${label.y})">`
    s += `<path d="${scallopPanel(x + 3, y + 3, w, h, 8, 6)}" fill="${P.darkRed}" opacity="0.9"/>`
    s += `<path d="${scallopPanel(x, y, w, h, 8, 6)}" fill="${P.panelRed}" stroke="${P.ink}" stroke-width="2.6"/>`
    s += `<rect x="${x + 4.5}" y="${y + 4.5}" width="${w - 9}" height="${h - 15}" fill="none" stroke="${P.marigold}" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.85"/>`
    s += `<text x="${label.x}" y="${y + 26}" text-anchor="middle" font-family="Baloo Da 2" font-weight="700" font-size="21"
        fill="${P.cream}" stroke="${P.ink}" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">${label.bn}</text>`
    s += `<text x="${label.x}" y="${y + 43}" text-anchor="middle" font-family="Baloo Da 2" font-weight="700" font-size="10.5" letter-spacing="2.4" fill="${P.marigold}">${label.en}</text>`
    return s + '</g>'
}

// Mughal-style elevation vignettes ------------------------------------------
const teaGardenVignette = (x, y) =>
{
    let s = `<g transform="translate(${x} ${y})">`
    s += `<path d="M -34 6 Q -20 -14 -6 6 Z" fill="${P.leafGreen}" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/>`
    s += `<path d="M -2 6 Q 16 -20 34 6 Z" fill="${P.leafFluo}" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/>`
    for(let r = 0; r < 3; r++)
    {
        const y0 = 12 + r * 8
        let d = `M ${-36 + (r % 2) * 6} ${y0}`
        for(let k = 0; k < 6 - (r % 2); k++) d += ` q 6 -6 12 0`
        s += `<path d="${d}" fill="none" stroke="${P.leafGreen}" stroke-width="3" stroke-linecap="round"/>`
        s += `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="1" opacity="0.65"/>`
    }
    return s + '</g>'
}

const domeVignette = (x, y) =>
    `<g transform="translate(${x} ${y})">
        <rect x="-14" y="-6" width="28" height="14" fill="${P.cream}" stroke="${P.ink}" stroke-width="2"/>
        <path d="M -10 -6 A 10 10 0 0 1 10 -6 Z" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2"/>
        <path d="M 0 -16 L 0 -21 M -2.5 -18.5 L 2.5 -18.5" stroke="${P.ink}" stroke-width="1.6"/>
        <rect x="-19" y="-12" width="4" height="20" fill="${P.cream}" stroke="${P.ink}" stroke-width="1.6"/>
        <rect x="15" y="-12" width="4" height="20" fill="${P.cream}" stroke="${P.ink}" stroke-width="1.6"/>
        <circle cx="-17" cy="-14" r="2.6" fill="${P.marigold}" stroke="${P.ink}" stroke-width="1.4"/>
        <circle cx="17" cy="-14" r="2.6" fill="${P.marigold}" stroke="${P.ink}" stroke-width="1.4"/>
        <rect x="-4" y="0" width="8" height="8" fill="${P.ink}"/>
    </g>`

const noukaVignette = (x, y) =>
    `<g transform="translate(${x} ${y})">
        <path d="M -24 0 Q 0 10 24 0 Q 18 -4 12 -4 L -16 -4 Q -21 -4 -24 0 Z" fill="${P.darkRed}" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M -8 -4 A 9 9 0 0 1 10 -4" fill="${P.cream}" stroke="${P.ink}" stroke-width="1.8"/>
        <path d="M 16 -4 L 20 -14" stroke="${P.ink}" stroke-width="1.6"/>
    </g>`

const kanthaFish = (x, y, flip = 1) =>
    `<g transform="translate(${x} ${y}) scale(${flip} 1)" fill="none" stroke="${P.cream}" stroke-width="1.8" stroke-linecap="round">
        <path d="M -16 0 Q -6 -8 6 0 Q -6 8 -16 0 Z"/>
        <path d="M 6 0 L 14 -5 L 14 5 Z"/>
        <path d="M -8 -2 Q -2 -4 2 -1 M -8 2 Q -2 4 2 1" stroke-width="1.2"/>
        <circle cx="-10" cy="-1" r="1" fill="${P.cream}" stroke="none"/>
    </g>`

// ---------------------------------------------------------------------------
// Overlay assembly
// ---------------------------------------------------------------------------
const buildOverlay = (variant, dims, nameW, waterAt) =>
{
    const night = variant === 'night'
    let s = `<svg width="${N}" height="${N}" viewBox="0 0 ${N} ${N}" xmlns="http://www.w3.org/2000/svg">`
    s += `<defs>
        <radialGradient id="edgeDark" cx="50%" cy="50%" r="71%">
            <stop offset="56%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="${night ? 0.2 : 0.12}"/>
        </radialGradient>
        <radialGradient id="lantern" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${P.lantern}" stop-opacity="0.95"/>
            <stop offset="45%" stop-color="${P.lantern}" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="${P.lantern}" stop-opacity="0"/>
        </radialGradient>
    </defs>`

    // --- zone blobs (under everything else)
    for(const label of LABELS)
    {
        if(!label.zone) continue
        const z = label.zone
        const outer = blobPath(z.cx, z.cy, z.rx, z.ry, z.seed)
        const inner = blobPath(z.cx, z.cy, z.rx * 0.82, z.ry * 0.82, z.seed)
        s += `<path d="${outer}" fill="${label.tint}" fill-opacity="0.20" stroke="${P.ink}" stroke-width="3" stroke-opacity="0.5" stroke-linejoin="round"/>`
        s += `<path d="${inner}" fill="none" stroke="${P.cream}" stroke-width="1.8" stroke-dasharray="6 5" stroke-opacity="0.7" stroke-linecap="round"/>`
    }

    // --- routes: night glow, marigold under-stroke, ink kantha dash
    let routes = ''
    ROUTES.forEach((pts, i) =>
    {
        const d = wobblePath(pts, 500 + i)
        if(night) routes += `<path d="${d}" fill="none" stroke="${P.marigold}" stroke-width="11" stroke-opacity="0.35" stroke-linecap="round"/>`
        routes += `<path d="${d}" fill="none" stroke="${P.marigold}" stroke-width="6" stroke-linecap="round" stroke-opacity="0.95"/>`
        routes += `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="3" stroke-dasharray="10 7" stroke-linecap="round"/>`
    })
    s += `<g>${routes}</g>`

    // --- vignettes
    s += teaGardenVignette(165, 356)
    s += teaGardenVignette(790, 352)
    s += domeVignette(712, 802)
    if(waterAt(630, 148)) s += noukaVignette(630, 148)
    if(waterAt(240, 712)) s += kanthaFish(240, 712)
    if(waterAt(262, 728)) s += kanthaFish(262, 728, -1)
    if(waterAt(852, 700)) s += kanthaFish(852, 700)

    // --- night: moon glint + lantern glows (day/night terrain differs below)
    if(night)
    {
        s += `<g stroke="${P.cream}" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.85">
            <path d="M 196 676 q 12 -3 24 0 q 12 3 24 0"/>
            <path d="M 208 688 q 9 -2.6 18 0 q 9 2.6 18 0"/>
            <path d="M 220 700 q 7 -2.2 14 0"/>
        </g>`
        for(const [lx, ly] of LANTERNS)
        {
            s += `<circle cx="${lx}" cy="${ly}" r="15" fill="url(#lantern)"/>`
            s += `<circle cx="${lx}" cy="${ly}" r="2.6" fill="#FFD98A" stroke="${P.ink}" stroke-width="1"/>`
        }
    }

    // --- nameplates
    for(const label of LABELS) s += namePlate(label, dims[label.en])

    // --- compass rose + cartouche
    s += compassRose(420, 845)
    s += cartouche(nameW)

    // --- corner alpana (inside band C)
    s += `<g>${cornerAlpana()}</g>`
    s += `<g transform="rotate(90 ${N / 2} ${N / 2})">${cornerAlpana()}</g>`
    s += `<g transform="rotate(180 ${N / 2} ${N / 2})">${cornerAlpana()}</g>`
    s += `<g transform="rotate(270 ${N / 2} ${N / 2})">${cornerAlpana()}</g>`

    // --- border bands (rotated top edge ×4) + corner rosettes
    s += `<g>${borderEdge()}</g>`
    s += `<g transform="rotate(90 ${N / 2} ${N / 2})">${borderEdge()}</g>`
    s += `<g transform="rotate(180 ${N / 2} ${N / 2})">${borderEdge()}</g>`
    s += `<g transform="rotate(270 ${N / 2} ${N / 2})">${borderEdge()}</g>`
    s += `<g>${cornerRosette()}</g>`
    s += `<g transform="translate(${N} 0) rotate(90)">${cornerRosette()}</g>`
    s += `<g transform="translate(${N} ${N}) rotate(180)">${cornerRosette()}</g>`
    s += `<g transform="translate(0 ${N}) rotate(270)">${cornerRosette()}</g>`

    // --- enamel pooling edge darkening
    s += `<rect x="0" y="0" width="${N}" height="${N}" fill="url(#edgeDark)"/>`
    return s + '</svg>'
}

// ---------------------------------------------------------------------------
// Player marker — top-down decorated rickshaw (front = left, like the
// original buggy icon whose boost chevrons point left)
// ---------------------------------------------------------------------------
const playerMarkerSvg = () =>
{
    const white = '#ffffff'
    let s = `<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">`
    // white sticker silhouette
    s += `<g fill="${white}" stroke="${white}" stroke-width="14" stroke-linejoin="round">
        <rect x="26" y="72" width="30" height="16" rx="6"/>
        <rect x="70" y="42" width="70" height="76" rx="16"/>
        <rect x="112" y="38" width="34" height="12" rx="5"/>
        <rect x="112" y="110" width="34" height="12" rx="5"/>
        <rect x="50" y="52" width="10" height="56" rx="4"/>
    </g>`
    // front wheel + handlebar
    s += `<rect x="24" y="73" width="34" height="14" rx="7" fill="#2A2A2A" stroke="${P.ink}" stroke-width="2.5"/>`
    s += `<rect x="27" y="77.5" width="28" height="5" rx="2.5" fill="#C9CDD4"/>`
    s += `<rect x="51" y="52" width="8" height="56" rx="4" fill="#1C1E22" stroke="${P.ink}" stroke-width="2"/>`
    s += `<circle cx="55" cy="49" r="5" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2"/>`
    s += `<circle cx="55" cy="111" r="5" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2"/>`
    // footboard
    s += `<rect x="58" y="62" width="18" height="36" rx="4" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2.5"/>`
    s += `<path d="M 62 66 L 62 94 M 68 66 L 68 94" stroke="${P.ink}" stroke-width="2" opacity="0.55"/>`
    // rear wheels
    s += `<rect x="110" y="36" width="38" height="14" rx="7" fill="#2A2A2A" stroke="${P.ink}" stroke-width="2.5"/>`
    s += `<rect x="113" y="40.5" width="32" height="5" rx="2.5" fill="#C9CDD4"/>`
    s += `<rect x="110" y="110" width="38" height="14" rx="7" fill="#2A2A2A" stroke="${P.ink}" stroke-width="2.5"/>`
    s += `<rect x="113" y="114.5" width="32" height="5" rx="2.5" fill="#C9CDD4"/>`
    // canopy (hood) with marigold scallop trim at the rear edge
    s += `<rect x="72" y="44" width="66" height="72" rx="15" fill="${P.panelRed}" stroke="${P.ink}" stroke-width="3"/>`
    s += `<rect x="78" y="50" width="54" height="60" rx="10" fill="none" stroke="${P.marigold}" stroke-width="2.5"/>`
    for(let k = 0; k < 5; k++)
        s += `<circle cx="136" cy="${52 + k * 14}" r="6" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2"/>`
    // hood medallion (appliqué rose)
    s += `<circle cx="103" cy="80" r="12" fill="${P.marigold}" stroke="${P.ink}" stroke-width="2.5"/>`
    for(let p = 0; p < 6; p++)
        s += `<path d="M 0 0 Q 3 -5 0 -9 Q -3 -5 0 0" transform="translate(103 80) rotate(${p * 60})" fill="${P.shaplaPink}" stroke="none"/>`
    s += `<circle cx="103" cy="80" r="2.6" fill="${P.panelRed}"/>`
    return s + '</svg>'
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const main = async () =>
{
    const srcPath = path.join(ROOT, 'resources', 'theme1-backup', 'map-day.png')
    const outDir = path.join(ROOT, 'static', 'ui', 'map')
    const bdDir = path.join(ROOT, 'resources', 'bd-theme')

    console.log('Reading base render + computing masks…')
    const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true })
    const masks = computeMasks(data, info.channels)
    const waterAt = (x, y) => masks.waterInner[y * N + x] > 0

    console.log('Measuring label text…')
    const dims = {}
    for(const label of LABELS)
    {
        dims[label.en] = {
            bn: await measureText(label.bn, 'Baloo Da 2', 700, 21),
            en: await measureText(label.en, 'Baloo Da 2', 700, 10.5, 2.4),
        }
    }
    const nameW = (await measureText('রামিম আহমেদ', 'Galada', 400, 44)).w

    const kalkaLayer = await maskedSvgLayer(kalkaSvg(), masks.land, 0.05)

    for(const variant of ['day', 'night'])
    {
        console.log(`Building map-${variant}…`)
        const night = variant === 'night'
        const terrain = paintTerrain(data, info.channels, masks, variant)
        const fishLayer = await maskedSvgLayer(fishScaleSvg(), masks.waterInner, night ? 0.3 : 0.55)
        const overlay = Buffer.from(buildOverlay(variant, dims, nameW, waterAt))

        const image = sharp(terrain, { raw: { width: N, height: N, channels: 3 } })
            .composite([
                kalkaLayer,
                fishLayer,
                { input: overlay, top: 0, left: 0 },
            ])

        await image.clone().png({ compressionLevel: 9 }).toFile(path.join(outDir, `map-${variant}.png`))
        await image.clone().webp({ quality: 80 }).toFile(path.join(outDir, `map-${variant}.webp`))

        // previews for review
        await sharp(path.join(outDir, `map-${variant}.png`)).resize(512, 512).png().toFile(path.join(bdDir, `preview-map-${variant}.png`))
        console.log(`map-${variant} written (png + webp)`)
    }

    // cartouche close-up preview (day)
    await sharp(path.join(outDir, 'map-day.png'))
        .extract({ left: 232, top: 60, width: 560, height: 200 })
        .png().toFile(path.join(bdDir, 'preview-cartouche.png'))

    // player marker
    console.log('Building player marker…')
    const marker = sharp(Buffer.from(playerMarkerSvg())).resize(160, 160)
    await marker.clone().png({ compressionLevel: 9 }).toFile(path.join(outDir, 'player.png'))
    await marker.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'player.webp'))

    console.log('Done.')
}

await main()
