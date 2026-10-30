// ---------------------------------------------------------------------------
// build-rickshaw-glb.js — Sonar Bangla theme
// Procedurally generates a Dhaka cycle-rickshaw as static/vehicle/default.glb
// (and default-compressed.glb copy), replacing Bruno Simon's car while keeping
// the exact node skeleton VisualVehicle.js expects:
//   chassis { bodyPainted, common, artBoard, headlights, blinkerLeft,
//             blinkerRight, stopLights, backLights, energy, cell1..3 }
//   wheelContainer { wheelCylinder { wheel, wheelPainted }, wheelGuard,
//                    wheelSuspension }
// Physics is untouched: wheels x ±0.90 / z ±0.75, radius 0.4, forward = +x.
// Ground sits ~1.28 below the chassis origin at rest (suspension low 0.88 +
// wheel radius 0.4). All palette parts use single-point UVs inside a 4px
// swatch of the 128x4 static/palette.png (24 swatches, u = (idx+0.5)/32).
//
// Usage: node scripts/build-rickshaw-glb.js
// ---------------------------------------------------------------------------
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Document, NodeIO } from '@gltf-transform/core'
import { Resvg } from '@resvg/resvg-js'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')

// ---------------------------------------------------------------------------
// Palette swatch indices (role-based picks against the CURRENT palette —
// another agent repaints palette.png keeping each swatch's role)
// ---------------------------------------------------------------------------
const SW = {
    frameBlack: 22,   // #1e0603 near-black  -> frame, tires, saddle, struts
    chrome: 4,        // #c9c5c6 light grey  -> rims, spokes, handlebar, bell
    crimson: 19,      // #a51132 crimson     -> mudguards, apron, bench skirt
    gold: 8,          // #d2a018 gold        -> trims, scallops, striping
    magenta: 21,      // #de6590 pink        -> medallion, rosettes, tassels
    sky: 3,           // #33a9d6 sky blue    -> side panels (peacock blue role)
    green: 9,         // #7fa26c sage green  -> pennant (green role)
}
const swatchU = (idx) => (idx + 0.5) / 32

// ---------------------------------------------------------------------------
// Small geometry helpers (three.js used purely as a geometry math library)
// ---------------------------------------------------------------------------
const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()

function xform(geo, { t = [0, 0, 0], e = [0, 0, 0], s = [1, 1, 1] } = {})
{
    _q.setFromEuler(new THREE.Euler(e[0], e[1], e[2], 'XYZ'))
    _m.compose(new THREE.Vector3(...t), _q, new THREE.Vector3(...s))
    geo.applyMatrix4(_m)
    return geo
}

// Set every UV to a single point inside the given palette swatch
function swatch(geo, idx)
{
    const uv = geo.attributes.uv
    for(let i = 0; i < uv.count; i++)
        uv.setXY(i, swatchU(idx), 0.5)
    geo.userData.swatch = idx
    return geo
}

// Reverse winding + negate normals (for double-siding open surfaces)
function flipped(geo)
{
    const g = geo.clone()
    const index = g.index
    if(index)
    {
        for(let i = 0; i < index.count; i += 3)
        {
            const b = index.getX(i + 1)
            index.setX(i + 1, index.getX(i + 2))
            index.setX(i + 2, b)
        }
    }
    const n = g.attributes.normal
    for(let i = 0; i < n.count; i++)
        n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i))
    return g
}

const dbl = (geo) => mergeGeometries([ geo, flipped(geo) ])

// Capped straight bar between two points (CylinderGeometry aligned to p1->p2)
function bar(p1, p2, r, radialSeg = 8)
{
    const a = new THREE.Vector3(...p1)
    const b = new THREE.Vector3(...p2)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const geo = new THREE.CylinderGeometry(r, r, len, radialSeg, 1)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    geo.applyQuaternion(quat)
    geo.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
    return geo
}

// Curved tube along points
function tube(points, r, tubularSeg = 12, radialSeg = 7)
{
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, tubularSeg, r, radialSeg, false)
}

const box = (cx, cy, cz, sx, sy, sz) => xform(new THREE.BoxGeometry(sx, sy, sz), { t: [ cx, cy, cz ] })

// Disc (CircleGeometry) at position with normal direction
function disc(r, pos, normal, segments = 16)
{
    const geo = new THREE.CircleGeometry(r, segments)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...normal).normalize())
    geo.applyQuaternion(quat)
    geo.translate(...pos)
    return geo
}

// Indexed quad from 4 corners (a,b,c,d counter-clockwise seen from front)
function quad(a, b, c, d, uvs = [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ] ])
{
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array([ ...a, ...b, ...c, ...d ])
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs.flat()), 2))
    geo.setIndex([ 0, 1, 2, 0, 2, 3 ])
    geo.computeVertexNormals()
    return geo
}

function triangle(a, b, c)
{
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([ ...a, ...b, ...c ]), 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([ 0, 0, 0, 1, 1, 1 ]), 2))
    geo.setIndex([ 0, 1, 2 ])
    geo.computeVertexNormals()
    return geo
}

// Parametric grid surface: fn(u01, v01) -> { p:[x,y,z], n:[x,y,z] }
function grid(fn, nu, nv)
{
    const positions = [], normals = [], uvs = [], indices = []
    for(let iv = 0; iv <= nv; iv++)
    {
        for(let iu = 0; iu <= nu; iu++)
        {
            const { p, n } = fn(iu / nu, iv / nv)
            positions.push(...p)
            normals.push(...n)
            uvs.push(iu / nu, iv / nv)
        }
    }
    for(let iv = 0; iv < nv; iv++)
    {
        for(let iu = 0; iu < nu; iu++)
        {
            const a = iv * (nu + 1) + iu
            const b = a + 1
            const c = a + nu + 1
            const d = c + 1
            indices.push(a, c, b, b, c, d)
        }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    geo.setIndex(indices)
    return geo
}

// Strip only position/normal/uv (uniform attribute sets for merging)
function clean(geo)
{
    const keep = [ 'position', 'normal', 'uv' ]
    for(const name of Object.keys(geo.attributes))
        if(!keep.includes(name))
            geo.deleteAttribute(name)
    return geo
}

function mergeAll(list)
{
    return mergeGeometries(list.map(clean))
}

// Height/length-based UVs for the painted (gradient) parts.
// Convention (matches Bruno's export): v = 0 at the TOP -> gradient colorA.
function paintedUVs(geo)
{
    geo.computeBoundingBox()
    const bb = geo.boundingBox
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    const sx = Math.max(1e-6, bb.max.x - bb.min.x)
    const sy = Math.max(1e-6, bb.max.y - bb.min.y)
    for(let i = 0; i < pos.count; i++)
    {
        uv.setXY(
            i,
            (pos.getX(i) - bb.min.x) / sx,
            (bb.max.y - pos.getY(i)) / sy
        )
    }
    geo.setAttribute('uv1', new THREE.BufferAttribute(uv.array.slice(), 2))
    return geo
}

// ---------------------------------------------------------------------------
// Hood (kamani) canopy — spherical section around pivot C, radius R
// phi: fan angle in the XY side view (0 = +x), psi: side-to-side
// ---------------------------------------------------------------------------
const HOOD = {
    C: [ -0.68, -0.30, 0 ],
    R: 0.78,
    phi0: THREE.MathUtils.degToRad(25),
    phi1: THREE.MathUtils.degToRad(160),
    psiMax: THREE.MathUtils.degToRad(57),
}

function hoodPoint(phi, psi, r = HOOD.R)
{
    return [
        HOOD.C[0] + r * Math.cos(psi) * Math.cos(phi),
        HOOD.C[1] + r * Math.cos(psi) * Math.sin(phi),
        HOOD.C[2] + r * Math.sin(psi),
    ]
}

function canopyGeometry()
{
    return grid((u, v) =>
    {
        const phi = HOOD.phi0 + (HOOD.phi1 - HOOD.phi0) * u
        const psi = -HOOD.psiMax + 2 * HOOD.psiMax * v
        const p = hoodPoint(phi, psi)
        const n = [
            (p[0] - HOOD.C[0]) / HOOD.R,
            (p[1] - HOOD.C[1]) / HOOD.R,
            (p[2] - HOOD.C[2]) / HOOD.R,
        ]
        return { p, n }
    }, 14, 10)
}

// Kamani bow: arc over z at fan angle phi (torus arc rotated into place)
function bow(phi, r, tubeR)
{
    const arc = 2 * HOOD.psiMax
    const geo = new THREE.TorusGeometry(r, tubeR, 6, 14, arc)
    // torus arc starts at +x; center it, stand it up over z, fan it to phi
    geo.rotateZ(-arc / 2)             // arc now spans -psiMax..psiMax around +x
    geo.rotateX(Math.PI / 2)          // arc plane -> xz (over z axis)
    geo.rotateZ(phi)                  // fan into place
    geo.translate(...HOOD.C)
    return geo
}

// Side rim arc: canopy edge circle at z = ±zEdge (radius R cos(psiMax))
function sideRim(sign, tubeR, swIdx)
{
    const r = HOOD.R * Math.cos(HOOD.psiMax)
    const arc = HOOD.phi1 - HOOD.phi0
    const geo = new THREE.TorusGeometry(r, tubeR, 6, 14, arc)
    geo.rotateZ(HOOD.phi0)
    geo.translate(HOOD.C[0], HOOD.C[1], sign * HOOD.R * Math.sin(HOOD.psiMax))
    return swatch(geo, swIdx)
}

// ---------------------------------------------------------------------------
// Rear art board painting (the hero texture) — 256x144 rickshaw-art panel
// ---------------------------------------------------------------------------
function artBoardPng()
{
    const W = 256, H = 144
    const ink = '#140a08', gold = '#FFC907', mag = '#E4007C', grn = '#1FA637',
          cyan = '#33B6E5', white = '#FFF6EC', cobalt = '#1F3FA8', red = '#E23B2E'

    // Peacock tail fan
    let feathers = ''
    const fx = 96, fy = 96
    for(let i = 0; i < 7; i++)
    {
        const a = -84 + i * 28 // degrees, fan around up
        feathers += `
        <g transform="rotate(${a} ${fx} ${fy})">
            <ellipse cx="${fx}" cy="${fy - 40}" rx="13" ry="30" fill="${mag}" stroke="${white}" stroke-width="2"/>
            <ellipse cx="${fx}" cy="${fy - 44}" rx="8" ry="20" fill="${gold}" stroke="${ink}" stroke-width="1"/>
            <circle cx="${fx}" cy="${fy - 50}" r="5.5" fill="${cyan}" stroke="${ink}" stroke-width="1.5"/>
            <circle cx="${fx}" cy="${fy - 50}" r="2" fill="${ink}"/>
        </g>`
    }

    // Corner flowers
    const flower = (cx, cy, s) =>
    {
        let petals = ''
        for(let i = 0; i < 6; i++)
            petals += `<ellipse cx="${cx}" cy="${cy - 7 * s}" rx="${3.4 * s}" ry="${6 * s}" fill="${mag}" stroke="${white}" stroke-width="1" transform="rotate(${i * 60} ${cx} ${cy})"/>`
        return `${petals}<circle cx="${cx}" cy="${cy}" r="${3.6 * s}" fill="${gold}" stroke="${ink}" stroke-width="1"/>`
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <rect width="${W}" height="${H}" fill="${cobalt}"/>
        <rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" fill="none" stroke="${gold}" stroke-width="5"/>
        <rect x="7" y="7" width="${W - 14}" height="${H - 14}" fill="none" stroke="${ink}" stroke-width="2"/>
        <rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="${white}" stroke-width="1.4"/>

        ${feathers}

        <!-- peacock body -->
        <ellipse cx="122" cy="98" rx="15" ry="24" fill="${grn}" stroke="${white}" stroke-width="2" transform="rotate(-14 122 98)"/>
        <path d="M 126 84 C 132 70 134 62 138 56" fill="none" stroke="${grn}" stroke-width="9" stroke-linecap="round"/>
        <circle cx="139" cy="53" r="8" fill="${grn}" stroke="${white}" stroke-width="1.6"/>
        <polygon points="146,52 156,55 146,58" fill="${gold}" stroke="${ink}" stroke-width="1"/>
        <circle cx="141.5" cy="51" r="1.7" fill="${white}"/>
        <circle cx="141.9" cy="51.2" r="0.8" fill="${ink}"/>
        <g stroke="${ink}" stroke-width="1">
            <line x1="137" y1="46" x2="134" y2="40"/><line x1="140" y1="45" x2="140" y2="38"/><line x1="143" y1="46" x2="146" y2="40"/>
        </g>
        <circle cx="134" cy="38.5" r="2.4" fill="${mag}"/><circle cx="140" cy="36.5" r="2.4" fill="${mag}"/><circle cx="146" cy="38.5" r="2.4" fill="${mag}"/>
        <!-- feet -->
        <g stroke="${gold}" stroke-width="2.4" stroke-linecap="round">
            <line x1="118" y1="118" x2="116" y2="128"/><line x1="127" y1="119" x2="128" y2="128"/>
        </g>

        <!-- rose bouquet, right -->
        <g>
            <ellipse cx="206" cy="103" rx="9" ry="15" fill="${grn}" stroke="${ink}" stroke-width="1" transform="rotate(40 206 103)"/>
            <ellipse cx="232" cy="103" rx="9" ry="15" fill="${grn}" stroke="${ink}" stroke-width="1" transform="rotate(-40 232 103)"/>
            <circle cx="219" cy="88" r="14" fill="${red}" stroke="${white}" stroke-width="2"/>
            <circle cx="219" cy="88" r="8.5" fill="${mag}" stroke="${white}" stroke-width="1.4"/>
            <circle cx="219" cy="88" r="3.4" fill="${gold}"/>
            <path d="M 219 102 C 219 112 217 118 215 124" fill="none" stroke="${grn}" stroke-width="3"/>
        </g>
        ${flower(38, 40, 1)}
        ${flower(222, 36, 0.8)}

        <!-- sun rays top-left glow -->
        <g stroke="${gold}" stroke-width="1.6" opacity="0.9">
            <line x1="70" y1="26" x2="70" y2="18"/><line x1="80" y1="30" x2="85" y2="24"/><line x1="60" y1="30" x2="55" y2="24"/>
        </g>
        <circle cx="70" cy="34" r="6" fill="${gold}" stroke="${ink}" stroke-width="1.2"/>

        <!-- scallop chain bottom -->
        <g fill="${gold}" stroke="${ink}" stroke-width="1">
            ${Array.from({ length: 10 }, (_, i) => `<circle cx="${26 + i * 22.5}" cy="${H - 13}" r="4.5"/>`).join('')}
        </g>
    </svg>`

    return Buffer.from(new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng())
}

// ---------------------------------------------------------------------------
// Build all geometries
// ---------------------------------------------------------------------------
function buildGeometries()
{
    const out = {}

    // ------------------------------------------------------------------ common
    const common = []
    const S = SW

    // --- Frame (near-black swan-neck) ---
    common.push(swatch(tube([ [ 1.12, -0.33, 0 ], [ 1.00, -0.38, 0 ], [ 0.70, -0.42, 0 ], [ 0.44, -0.47, 0 ], [ 0.32, -0.68, 0 ], [ 0.30, -0.95, 0 ] ], 0.030, 14), S.frameBlack)) // swan-neck main tube
    common.push(swatch(bar([ 1.09, -0.26, 0 ], [ 1.17, -0.48, 0 ], 0.036), S.frameBlack)) // head tube
    common.push(swatch(bar([ 0.30, -0.95, 0 ], [ 0.275, -0.42, 0 ], 0.028), S.frameBlack)) // seat tube
    // rear cradle (swan tubes to the axle) — mirrored
    for(const sgn of [ 1, -1 ])
        common.push(swatch(tube([ [ 0.30, -0.55, 0 ], [ -0.05, -0.62, 0.40 * sgn ], [ -0.55, -0.68, 0.62 * sgn ], [ -0.90, -0.82, 0.70 * sgn ] ], 0.028, 14), S.frameBlack))
    common.push(swatch(bar([ -0.90, -0.86, -0.72 ], [ -0.90, -0.86, 0.72 ], 0.026), S.frameBlack)) // rear axle
    common.push(swatch(bar([ 0.30, -0.95, -0.15 ], [ 0.30, -0.95, 0.15 ], 0.028), S.frameBlack)) // bottom bracket axle

    // --- Handlebar (chrome) + grips + bell ---
    common.push(swatch(tube([ [ 1.09, -0.26, 0 ], [ 1.06, -0.20, 0 ], [ 1.00, -0.185, 0 ] ], 0.016, 8), S.chrome)) // stem
    common.push(swatch(tube([ [ 0.86, -0.22, -0.44 ], [ 0.94, -0.20, -0.30 ], [ 1.00, -0.185, 0 ], [ 0.94, -0.20, 0.30 ], [ 0.86, -0.22, 0.44 ] ], 0.015, 16), S.chrome)) // swept-back bar
    for(const sgn of [ 1, -1 ])
        common.push(swatch(bar([ 0.905, -0.207, 0.355 * sgn ], [ 0.855, -0.222, 0.445 * sgn ], 0.023), S.frameBlack)) // grips
    common.push(swatch(xform(new THREE.SphereGeometry(0.032, 8, 6), { t: [ 1.00, -0.155, 0.10 ] }), S.chrome)) // bell dome
    common.push(swatch(bar([ 1.00, -0.185, 0.10 ], [ 1.00, -0.16, 0.10 ], 0.008), S.chrome)) // bell base

    // --- Saddle ---
    common.push(swatch(box(0.24, -0.395, 0, 0.24, 0.045, 0.17), S.frameBlack))
    common.push(swatch(box(0.375, -0.398, 0, 0.10, 0.038, 0.09), S.frameBlack)) // nose

    // --- Drivetrain ---
    for(const sgn of [ 1, -1 ]) // cranks (opposed)
    {
        common.push(swatch(box(0.30 + 0.08 * sgn, -0.95, 0.158 * sgn, 0.18, 0.028, 0.022), S.frameBlack))
        common.push(swatch(box(0.30 + 0.17 * sgn, -0.95, 0.195 * sgn, 0.09, 0.02, 0.06), S.frameBlack)) // pedals
    }
    common.push(swatch(xform(new THREE.CylinderGeometry(0.10, 0.10, 0.018, 16), { t: [ 0.30, -0.95, 0.135 ], e: [ Math.PI / 2, 0, 0 ] }), S.chrome)) // chainring
    common.push(swatch(xform(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 12), { t: [ -0.90, -0.86, 0.135 ], e: [ Math.PI / 2, 0, 0 ] }), S.chrome)) // rear sprocket
    common.push(swatch(bar([ 0.30, -0.855, 0.135 ], [ -0.90, -0.812, 0.135 ], 0.011), S.frameBlack)) // chain top run
    common.push(swatch(bar([ 0.30, -1.046, 0.135 ], [ -0.90, -0.908, 0.135 ], 0.011), S.frameBlack)) // chain bottom run

    // --- Footboard with gold striping ---
    common.push(swatch(box(0.15, -0.905, 0, 0.44, 0.03, 0.58), S.frameBlack))
    for(const sgn of [ 1, -1 ])
        common.push(swatch(box(0.15, -0.887, 0.16 * sgn, 0.40, 0.007, 0.05), S.gold))

    // --- Bench skirt + rear apron (crimson w/ gold borders) ---
    common.push(swatch(box(-0.65, -0.815, 0, 0.74, 0.09, 1.16), S.crimson))
    common.push(swatch(box(-1.27, -0.72, 0, 0.07, 0.30, 1.06), S.crimson))
    for(const sgn of [ 1, -1 ])
        common.push(swatch(box(-1.306, -0.72, 0.505 * sgn, 0.012, 0.30, 0.03), S.gold))
    common.push(swatch(box(-1.306, -0.585, 0, 0.012, 0.03, 1.04), S.gold))
    common.push(swatch(box(-1.306, -0.855, 0, 0.012, 0.03, 1.04), S.gold))

    // --- Art board gold frame ---
    {
        const fx = -1.325, hw = 0.335, hh = 0.205, cs = 0.035
        common.push(swatch(box(fx, -0.70 + hh, 0, 0.02, cs, hw * 2 + cs), S.gold))
        common.push(swatch(box(fx, -0.70 - hh, 0, 0.02, cs, hw * 2 + cs), S.gold))
        common.push(swatch(box(fx, -0.70, hw, 0.02, hh * 2 - cs, cs), S.gold))
        common.push(swatch(box(fx, -0.70, -hw, 0.02, hh * 2 - cs, cs), S.gold))
    }

    // --- Side panels (peacock-blue with gold frame + magenta rosette) ---
    for(const sgn of [ 1, -1 ])
    {
        const z = 0.627 * sgn
        common.push(swatch(dbl(quad(
            [ -1.02, -0.795, z ], [ -1.02, -0.555, z ], [ -0.28, -0.555, z ], [ -0.28, -0.795, z ]
        )), S.sky))
        // gold frame bars
        common.push(swatch(box(-0.65, -0.560, z, 0.76, 0.018, 0.012), S.gold))
        common.push(swatch(box(-0.65, -0.790, z, 0.76, 0.018, 0.012), S.gold))
        common.push(swatch(box(-1.012, -0.675, z, 0.018, 0.25, 0.012), S.gold))
        common.push(swatch(box(-0.288, -0.675, z, 0.018, 0.25, 0.012), S.gold))
        // rosette
        common.push(swatch(dbl(disc(0.052, [ -0.65, -0.675, z + 0.008 * sgn ], [ 0, 0, sgn ], 12)), S.magenta))
    }

    // --- Kamani bows (hood frame) + side rims (gold) ---
    for(const phi of [ 32, 64, 96, 128 ])
        common.push(swatch(bow(THREE.MathUtils.degToRad(phi), HOOD.R + 0.012, 0.016), S.frameBlack))
    for(const sgn of [ 1, -1 ])
        common.push(sideRim(sgn, 0.012, S.gold))

    // --- Valance scallops (gold half-discs under the hood front edge) ---
    {
        const nrm = [ Math.cos(HOOD.phi0), Math.sin(HOOD.phi0), 0 ]
        for(let i = 0; i < 7; i++)
        {
            const psi = -HOOD.psiMax + (2 * HOOD.psiMax) * (i + 0.5) / 7
            const p = hoodPoint(HOOD.phi0, psi)
            p[1] -= 0.155
            common.push(swatch(dbl(disc(0.045, p, nrm, 10)), S.gold))
        }
    }

    // --- Hood medallion (gold ring + magenta rose) ---
    {
        const phi = THREE.MathUtils.degToRad(135)
        const nrm = [ Math.cos(phi), Math.sin(phi), 0 ]
        const p1 = hoodPoint(phi, 0, HOOD.R + 0.02)
        const p2 = hoodPoint(phi, 0, HOOD.R + 0.035)
        common.push(swatch(dbl(disc(0.10, p1, nrm, 14)), S.gold))
        common.push(swatch(dbl(disc(0.06, p2, nrm, 12)), S.magenta))
    }

    // --- Tassels (alternating magenta/gold cards) ---
    const tassel = (p, swIdx) =>
    {
        const g = dbl(quad(
            [ p[0] - 0.018, p[1], p[2] ], [ p[0] + 0.018, p[1], p[2] ],
            [ p[0] + 0.018, p[1] - 0.085, p[2] ], [ p[0] - 0.018, p[1] - 0.085, p[2] ]
        ))
        common.push(swatch(g, swIdx))
    }
    for(const sgn of [ 1, -1 ])
    {
        // hood side rim tassels
        for(let i = 0; i < 3; i++)
        {
            const phi = THREE.MathUtils.degToRad(45 + i * 30)
            const r = HOOD.R * Math.cos(HOOD.psiMax)
            const p = [ HOOD.C[0] + r * Math.cos(phi), HOOD.C[1] + r * Math.sin(phi), sgn * (HOOD.R * Math.sin(HOOD.psiMax) + 0.005) ]
            tassel(p, i % 2 === 0 ? S.magenta : S.gold)
        }
        // handlebar grip tassels
        for(let i = 0; i < 3; i++)
            tassel([ 0.83 + i * 0.045, -0.24, sgn * 0.455 ], i % 2 === 0 ? S.gold : S.magenta)
    }

    // --- Pennant (small green flag on the handlebar) ---
    common.push(swatch(bar([ 1.02, -0.24, -0.12 ], [ 1.02, 0.03, -0.12 ], 0.008), S.chrome))
    common.push(swatch(dbl(triangle([ 1.02, 0.03, -0.12 ], [ 1.02, -0.035, -0.12 ], [ 0.87, -0.005, -0.12 ])), S.green))

    // --- Headlamp housing (chrome, the emissive face is a separate mesh) ---
    common.push(swatch(xform(new THREE.CylinderGeometry(0.052, 0.045, 0.09, 12), { t: [ 1.175, -0.30, 0 ], e: [ 0, 0, -Math.PI / 2 ] }), S.chrome))

    out.common = mergeAll(common)

    // ------------------------------------------------------------- bodyPainted
    const painted = []
    painted.push(dbl(canopyGeometry()))
    // valance ribbon hanging from the front edge
    painted.push(dbl(grid((u, v) =>
    {
        const psi = -HOOD.psiMax + 2 * HOOD.psiMax * u
        const top = hoodPoint(HOOD.phi0, psi)
        return {
            p: [ top[0] + 0.01, top[1] - v * 0.15, top[2] ],
            n: [ Math.cos(HOOD.phi0), Math.sin(HOOD.phi0), 0 ],
        }
    }, 10, 1)))
    painted.push(box(-0.65, -0.665, 0, 0.78, 0.23, 1.24)) // bench
    painted.push(xform(new THREE.BoxGeometry(0.10, 0.56, 1.20), { t: [ -1.02, -0.31, 0 ], e: [ 0, 0, 0.21 ] })) // backrest (tilted)
    out.bodyPainted = paintedUVs(mergeAll(painted))

    // ---------------------------------------------------------------- artBoard
    {
        const x = -1.316, hh = 0.18, hw = 0.31
        // viewer behind the vehicle (looking +x) sees +z on their right
        out.artBoard = quad(
            [ x, -0.70 + hh, -hw ], [ x, -0.70 - hh, -hw ], [ x, -0.70 - hh, hw ], [ x, -0.70 + hh, hw ],
            [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ] ] // glTF convention: v=0 = top of image
        )
    }

    // ------------------------------------------------------------------ lights
    out.headlights = disc(0.045, [ 1.222, -0.30, 0 ], [ 1, 0, 0 ], 12)
    out.blinkerLeft = box(-1.315, -0.545, -0.44, 0.05, 0.06, 0.06)
    out.blinkerRight = box(-1.315, -0.545, 0.44, 0.05, 0.06, 0.06)
    out.stopLights = mergeAll([
        disc(0.05, [ -1.312, -0.66, -0.30 ], [ -1, 0, 0 ], 12),
        disc(0.05, [ -1.312, -0.66, 0.30 ], [ -1, 0, 0 ], 12),
    ])
    out.backLights = box(-1.312, -0.545, 0, 0.03, 0.05, 0.22)

    // ----------------------------------------------------------- energy, cells
    out.energy = box(-0.68, -0.88, -0.48, 0.42, 0.14, 0.16)
    out.cellsCage = swatch(dbl(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 10, 1, true)), SW.chrome)
    out.cellsEnergy = new THREE.CylinderGeometry(0.042, 0.042, 0.15, 10)

    // ------------------------------------------------------------------- wheel
    const wheel = []
    wheel.push(swatch(new THREE.TorusGeometry(0.40, 0.035, 8, 22), SW.frameBlack)) // tire
    wheel.push(swatch(new THREE.TorusGeometry(0.355, 0.016, 6, 22), SW.chrome)) // rim
    for(let i = 0; i < 8; i++) // spokes
    {
        const a = i * Math.PI / 4
        wheel.push(swatch(bar(
            [ 0.05 * Math.cos(a), 0.05 * Math.sin(a), 0.015 * (i % 2 ? 1 : -1) ],
            [ 0.35 * Math.cos(a), 0.35 * Math.sin(a), 0 ],
            0.009, 5
        ), SW.chrome))
    }
    wheel.push(swatch(xform(new THREE.CylinderGeometry(0.045, 0.045, 0.10, 10), { e: [ Math.PI / 2, 0, 0 ] }), SW.chrome)) // hub
    out.wheel = mergeAll(wheel)

    // painted hub caps, both faces
    {
        const caps = mergeAll([
            disc(0.13, [ 0, 0, 0.052 ], [ 0, 0, 1 ], 14),
            disc(0.13, [ 0, 0, -0.052 ], [ 0, 0, -1 ], 14),
        ])
        caps.setAttribute('uv1', new THREE.BufferAttribute(caps.attributes.uv.array.slice(), 2))
        out.wheelPainted = caps
    }

    // -------------------------------------------------------------- wheelGuard
    {
        const arc = THREE.MathUtils.degToRad(110)
        const shell = new THREE.TorusGeometry(0.465, 0.025, 6, 12, arc)
        shell.rotateZ(Math.PI / 2 - arc / 2) // center the arc on top
        shell.scale(1, 1, 2.6) // flatten tube into a ribbon (width ~0.13)
        const parts = [ swatch(shell, SW.crimson) ]
        for(const sgn of [ 1, -1 ])
        {
            const edge = new THREE.TorusGeometry(0.468, 0.008, 5, 12, arc)
            edge.rotateZ(Math.PI / 2 - arc / 2)
            edge.translate(0, 0, 0.058 * sgn)
            parts.push(swatch(edge, SW.gold))
        }
        out.wheelGuard = mergeAll(parts)
    }

    // --------------------------------------------------------- wheelSuspension
    // Original convention: mesh spans y 0..~0.97 above the node (node y=0.477
    // inside the container); the runtime drives scale.y = |containerY| - 0.5.
    out.wheelSuspension = swatch(xform(new THREE.CylinderGeometry(0.034, 0.034, 0.97, 8), { t: [ 0, 0.485, 0 ] }), SW.frameBlack)

    return out
}

// ---------------------------------------------------------------------------
// glTF assembly
// ---------------------------------------------------------------------------
async function main()
{
    const geos = buildGeometries()
    const doc = new Document()
    doc.createScene('Scene')
    const buffer = doc.createBuffer('buffer')

    // Textures
    const palettePng = fs.readFileSync(path.join(ROOT, 'static/palette.png'))
    const paletteTex = doc.createTexture('palette').setImage(new Uint8Array(palettePng)).setMimeType('image/png')
    const artPng = artBoardPng()
    fs.writeFileSync(path.join(ROOT, 'resources/bd-theme/rickshaw-art-board.png'), artPng)
    const artTex = doc.createTexture('rickshawArt').setImage(new Uint8Array(artPng)).setMimeType('image/png')

    // Materials — NAMES are the contract (Materials.getFromName)
    const mats = {}
    mats.palette = doc.createMaterial('palette').setBaseColorTexture(paletteTex).setMetallicFactor(0).setRoughnessFactor(1).setDoubleSided(true)
    mats.redGradient = doc.createMaterial('redGradient').setBaseColorFactor([ 1, 0.048, 0, 1 ]).setMetallicFactor(0).setRoughnessFactor(1).setDoubleSided(true)
    mats.emissiveOrange = doc.createMaterial('emissiveOrangeRadialGradient').setBaseColorFactor([ 0, 0, 0, 1 ]).setEmissiveFactor([ 1, 0.1725, 0 ]).setMetallicFactor(0).setRoughnessFactor(1).setDoubleSided(true)
    mats.emissivePurple = doc.createMaterial('emissivePurpleRadialGradient').setBaseColorFactor([ 0, 0, 0, 1 ]).setEmissiveFactor([ 0.4755, 0.1053, 1 ]).setMetallicFactor(0).setRoughnessFactor(1).setDoubleSided(true)
    mats.darkGray = doc.createMaterial('darkGray').setBaseColorFactor([ 0.1743, 0.1455, 0.1032, 1 ]).setMetallicFactor(0).setRoughnessFactor(0.5).setDoubleSided(true)
    mats.rickshawArt = doc.createMaterial('rickshawArt').setBaseColorTexture(artTex).setMetallicFactor(0).setRoughnessFactor(1)

    const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0]

    function makePrim(geo, material)
    {
        const prim = doc.createPrimitive().setMaterial(material)
        const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(geo.attributes.position.array)).setBuffer(buffer)
        prim.setAttribute('POSITION', pos)
        if(geo.attributes.normal)
            prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(geo.attributes.normal.array)).setBuffer(buffer))
        if(geo.attributes.uv)
            prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(geo.attributes.uv.array)).setBuffer(buffer))
        if(geo.attributes.uv1)
            prim.setAttribute('TEXCOORD_1', doc.createAccessor().setType('VEC2').setArray(new Float32Array(geo.attributes.uv1.array)).setBuffer(buffer))
        const idxArray = geo.index.count <= 65535
            ? new Uint16Array(geo.index.array)
            : new Uint32Array(geo.index.array)
        prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(idxArray).setBuffer(buffer))
        return prim
    }

    function makeNode(name, geo, material, translation = [ 0, 0, 0 ])
    {
        const node = doc.createNode(name).setTranslation(translation)
        if(geo)
            node.setMesh(doc.createMesh(name).addPrimitive(makePrim(geo, material)))
        return node
    }

    // ----- chassis subtree (order chosen so no reserved-prefix collisions) ---
    const chassis = makeNode('chassis', null).setTranslation([ 0, 0.907, 0 ])
    chassis.addChild(makeNode('bodyPainted', geos.bodyPainted, mats.redGradient))
    chassis.addChild(makeNode('common', geos.common, mats.palette))
    chassis.addChild(makeNode('artBoard', geos.artBoard, mats.rickshawArt))
    chassis.addChild(makeNode('headlights', geos.headlights, mats.emissiveOrange))
    chassis.addChild(makeNode('blinkerLeft', geos.blinkerLeft, mats.emissiveOrange))
    chassis.addChild(makeNode('blinkerRight', geos.blinkerRight, mats.emissiveOrange))
    chassis.addChild(makeNode('stopLights', geos.stopLights, mats.emissiveOrange))
    chassis.addChild(makeNode('backLights', geos.backLights, mats.emissiveOrange))
    chassis.addChild(makeNode('energy', geos.energy, mats.darkGray))

    // boost cells: cellN nodes animate y between 0.2 (idle) and 0 (boost)
    const cellXs = [ -0.50, -0.68, -0.86 ]
    for(let i = 0; i < 3; i++)
    {
        const cell = makeNode(`cell${i + 1}`, null).setTranslation([ 0, 0.2, 0 ])
        cell.addChild(makeNode(`cellsCage.00${i + 1}`, geos.cellsCage, mats.palette, [ cellXs[i], -1.10, 0.50 ]))
        cell.addChild(makeNode(`cellsEnergy.00${i + 1}`, geos.cellsEnergy, mats.emissivePurple, [ cellXs[i], -1.10, 0.50 ]))
        chassis.addChild(cell)
    }

    scene.addChild(chassis)

    // ----- wheelContainer subtree (cloned 4x by VisualVehicle) --------------
    const wheelContainer = makeNode('wheelContainer', null).setTranslation([ 0.872, -0.417, -0.699 ])
    const wheelCylinder = makeNode('wheelCylinder', null)
    wheelCylinder.addChild(makeNode('wheel', geos.wheel, mats.palette))
    wheelCylinder.addChild(makeNode('wheelPainted', geos.wheelPainted, mats.redGradient))
    wheelContainer.addChild(wheelCylinder)
    wheelContainer.addChild(makeNode('wheelGuard', geos.wheelGuard, mats.palette))
    const suspension = makeNode('wheelSuspension', geos.wheelSuspension, mats.palette, [ 0, 0.477, 0 ])
    suspension.setScale([ 1, 0.38, 1 ]) // rest pose; runtime drives scale.y
    wheelContainer.addChild(suspension)

    scene.addChild(wheelContainer)

    // ----- write -------------------------------------------------------------
    const io = new NodeIO()
    const outPath = path.join(ROOT, 'static/vehicle/default.glb')
    await io.write(outPath, doc)
    fs.copyFileSync(outPath, path.join(ROOT, 'static/vehicle/default-compressed.glb'))

    const size = fs.statSync(outPath).size
    console.log(`Wrote ${outPath} (${(size / 1024).toFixed(1)} kB) + default-compressed.glb copy`)
}

main().catch((err) => { console.error(err); process.exit(1) })
