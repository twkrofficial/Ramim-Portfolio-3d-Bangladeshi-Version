/**
 * Theme 3 "Sonar Bangla" intro asset generator.
 *
 * Regenerates the intro start-label textures, the sound-toggle sprite and the
 * overlay wipe pattern in the rickshaw-paint style (white art on black — the
 * Intro.js label shader reads ONLY the red channel as a mask, alpha is ignored;
 * the sound sprite is used as an alphaMap; the overlay pattern's ALPHA channel
 * holds the wipe motif, remapped 0→0.68 in Overlay.js).
 *
 * Bengali text is rendered through sharp's Pango/HarfBuzz text input with the
 * local TTFs (resources/bd-theme/fonts) so conjuncts (ক্লিক, স্বাগতম) and vowel
 * signs shape correctly — resvg (rustybuzz) was tested and shapes Bengali
 * incorrectly, so resvg is only used for pure-vector art (arrows, icons).
 *
 * Usage: node scripts/theme3-intro-assets.js
 */
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const FONTS_DIR = path.join(ROOT, 'resources', 'bd-theme', 'fonts')
const INTRO_DIR = path.join(ROOT, 'static', 'intro')
const OVERLAY_DIR = path.join(ROOT, 'static', 'overlay')

const BALOO = path.join(FONTS_DIR, 'BalooDa2.ttf')

const W = 256
const H = 128

/**
 * White text on transparent, shaped by Pango/HarfBuzz.
 * letterSpacing is in px (converted to Pango 1024ths of a point).
 */
const textImage = async (text, font, fontfile = BALOO, letterSpacing = 0) =>
{
    const spacingAttr = letterSpacing ? ` letter_spacing="${Math.round(letterSpacing * 1024)}"` : ''
    const markup = `<span foreground="white"${spacingAttr}>${text}</span>`

    const buf = await sharp({
        text: {
            text: markup,
            rgba: true,
            fontfile,
            font,
            dpi: 72,
        }
    }).png().toBuffer()

    const meta = await sharp(buf).metadata()
    return { buf, w: meta.width, h: meta.height }
}

/**
 * Pure-vector SVG → PNG buffer via resvg (no text involved).
 */
const vectorImage = (svg) => new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng()

/**
 * Hand-drawn-ish curved arrow pointing down-left (same spot as the original
 * mouseKeyboard label art). White stroke, round caps. 64×48 viewBox.
 */
const arrowImage = () => vectorImage(`
<svg width="64" height="48" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 58 4 C 48 26, 30 40, 8 41"/>
        <path d="M 8 41 l 12 -9"/>
        <path d="M 8 41 l 14 5"/>
    </g>
</svg>`)

/**
 * Round gamepad button glyph — stroke circle, optionally with a PlayStation
 * cross inside. 34×34 viewBox (r=14 circle + stroke).
 */
const gamepadGlyphImage = (withCross) => vectorImage(`
<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
    <circle cx="17" cy="17" r="13.5" fill="none" stroke="#ffffff" stroke-width="3"/>
    ${withCross ? `
    <g stroke="#ffffff" stroke-width="3" stroke-linecap="round">
        <line x1="11.5" y1="11.5" x2="22.5" y2="22.5"/>
        <line x1="11.5" y1="22.5" x2="22.5" y2="11.5"/>
    </g>` : ''}
</svg>`)

/** Small ✕ drawn as vector (fonts may lack U+2715). 12×12. */
const smallCrossImage = () => vectorImage(`
<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.92">
        <line x1="2" y1="2" x2="10" y2="10"/>
        <line x1="2" y1="10" x2="10" y2="2"/>
    </g>
</svg>`)

/** Composite helper: place an image centered at (cx, cy) on the label. */
const at = (img, cx, cy) => ({
    input: img.buf ?? img,
    left: Math.round(cx - (img.w ?? 0) / 2),
    top: Math.round(cy - (img.h ?? 0) / 2),
})

/**
 * Build one 256×128 label: black base + composites.
 */
const buildLabel = async (name, composites) =>
{
    const outPath = path.join(INTRO_DIR, `${name}.png`)

    await sharp({ create: { width: W, height: H, channels: 4, background: '#000000ff' } })
        .composite(composites)
        .png()
        .toFile(outPath)

    return outPath
}

const buildLabels = async () =>
{
    const arrowPng = arrowImage()
    const arrow = { buf: arrowPng, w: 64, h: 48 }
    const arrowPlacement = { input: arrowPng, left: 6, top: 74 }
    void arrow

    const paths = []

    // Mouse / keyboard — চালু করতে ক্লিক করুন + CLICK TO START
    {
        const l1 = await textImage('চালু করতে', 'Baloo Da 2 Bold 30')
        const l2 = await textImage('ক্লিক করুন', 'Baloo Da 2 Bold 30')
        const l3 = await textImage('CLICK TO START', 'Baloo Da 2 Bold 13', BALOO, 3)
        paths.push(await buildLabel('mouseKeyboardLabel', [
            at(l1, 150, 28),
            at(l2, 150, 66),
            at(l3, 150, 105),
            arrowPlacement,
        ]))
    }

    // Touch — শুরু করতে চাপুন + TAP TO START
    {
        const l1 = await textImage('শুরু করতে', 'Baloo Da 2 Bold 30')
        const l2 = await textImage('চাপুন', 'Baloo Da 2 Bold 30')
        const l3 = await textImage('TAP TO START', 'Baloo Da 2 Bold 13', BALOO, 3)
        paths.push(await buildLabel('touchLabel', [
            at(l1, 150, 28),
            at(l2, 150, 66),
            at(l3, 150, 105),
            arrowPlacement,
        ]))
    }

    // Gamepads — শুরু করতে চাপুন + PRESS A / PRESS ✕ with a button glyph
    for(const variant of [ 'xbox', 'playstation' ])
    {
        const l1 = await textImage('শুরু করতে', 'Baloo Da 2 Bold 30')
        const l2 = await textImage('চাপুন', 'Baloo Da 2 Bold 30')
        const press = await textImage('PRESS', 'Baloo Da 2 Bold 13', BALOO, 3)

        const glyphPng = gamepadGlyphImage(variant === 'playstation')
        const glyph = { buf: glyphPng, w: 34, h: 34 }
        const glyphCx = 133 + l2.w / 2 + 30

        const composites = [
            at(l1, 150, 28),
            at(l2, 133, 66),
            at(glyph, glyphCx, 66),
            at(press, 138, 105),
            arrowPlacement,
        ]

        if(variant === 'xbox')
        {
            // "A" centered in the circle + after PRESS
            const a = await textImage('A', 'Baloo Da 2 ExtraBold 17')
            const aSmall = await textImage('A', 'Baloo Da 2 Bold 13')
            composites.splice(3, 0, at(a, glyphCx, 66))
            composites.push(at(aSmall, 138 + press.w / 2 + 12, 105))
        }
        else
        {
            const cross = { buf: smallCrossImage(), w: 12, h: 12 }
            composites.push(at(cross, 138 + press.w / 2 + 13, 105))
        }

        paths.push(await buildLabel(`gamepad${variant === 'xbox' ? 'Xbox' : 'Playstation'}Label`, composites))
    }

    return paths
}

/**
 * Sound sprite — 100×40, two 50×40 cells (left = sound on, right = sound off),
 * white stroke art on black, same style family as the labels.
 */
const buildSound = async () =>
{
    const speaker = (ox) => `
        <path d="M ${ox + 7} 15.5 h 6.5 l 9.5 -8 v 25 l -9.5 -8 h -6.5 z"
            fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`

    const png = vectorImage(`
<svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="40" fill="#000000"/>
    ${speaker(0)}
    <g stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M 30 15.5 a 6 6 0 0 1 0 9"/>
        <path d="M 35 11.5 a 12 12 0 0 1 0 17"/>
    </g>
    ${speaker(50)}
    <g stroke="#ffffff" stroke-width="3" stroke-linecap="round">
        <line x1="81" y1="15" x2="91" y2="25"/>
        <line x1="81" y1="25" x2="91" y2="15"/>
    </g>
</svg>`)

    const outPath = path.join(INTRO_DIR, 'sound.png')
    fs.writeFileSync(outPath, png)
    return outPath
}

/**
 * Overlay wipe pattern — 128×128 tile whose ALPHA channel holds a soft shapla
 * (water lily) motif. Overlay.js remaps alpha 0→0.68, so peak alpha stays at
 * ~173 (0.68 × 255) to preserve the existing remap. The motif fades to zero
 * well before the tile edges so RepeatWrapping stays seamless.
 */
const buildOverlayPattern = async () =>
{
    const petals = []
    for(let i = 0; i < 8; i++)
    {
        const a = i * 45
        petals.push(`<path d="M 0 -14 C 9 -26, 9 -40, 0 -47 C -9 -40, -9 -26, 0 -14 Z"
            fill="#ffffff" transform="rotate(${a})"/>`)
    }

    const dots = []
    for(let i = 0; i < 8; i++)
    {
        const a = (i * 45 + 22.5) * Math.PI / 180
        dots.push(`<circle cx="${Math.sin(a) * 34}" cy="${-Math.cos(a) * 34}" r="4" fill="#ffffff" opacity="0.85"/>`)
    }

    const svg = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="#000000"/>
    <g transform="translate(64, 64)">
        ${petals.join('')}
        ${dots.join('')}
        <circle r="9" fill="#ffffff"/>
    </g>
</svg>`

    // Rasterize, soften (enamel-paint blob edges like the original pattern)
    const { data } = await sharp(vectorImage(svg))
        .blur(2.2)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true })

    // Build RGBA: white RGB, motif → alpha capped at 0.68 × 255 ≈ 173
    const rgba = Buffer.alloc(128 * 128 * 4)
    for(let i = 0; i < 128 * 128; i++)
    {
        rgba[i * 4 + 0] = 255
        rgba[i * 4 + 1] = 255
        rgba[i * 4 + 2] = 255
        rgba[i * 4 + 3] = Math.round(data[i] * 0.68)
    }

    const outPath = path.join(OVERLAY_DIR, 'overlayPattern.png')
    await sharp(rgba, { raw: { width: 128, height: 128, channels: 4 } })
        .png()
        .toFile(outPath)

    return outPath
}

/**
 * Sanity checks: dimensions + ink coverage on the red channel (catches empty /
 * unshaped output).
 */
const verify = async (filePath, expectedWidth, expectedHeight, minMean, maxMean) =>
{
    const image = sharp(filePath)
    const meta = await image.metadata()
    const stats = await image.stats()
    const mean = stats.channels[0].mean

    const sizeOk = meta.width === expectedWidth && meta.height === expectedHeight
    const inkOk = mean >= minMean && mean <= maxMean

    console.log(`${path.basename(filePath)}: ${meta.width}x${meta.height} channels=${meta.channels} redMean=${mean.toFixed(1)} ${sizeOk && inkOk ? 'OK' : '!! CHECK'}`)

    return sizeOk && inkOk
}

const run = async () =>
{
    let allOk = true

    for(const labelPath of await buildLabels())
        allOk = await verify(labelPath, W, H, 6, 90) && allOk

    allOk = await verify(await buildSound(), 100, 40, 6, 90) && allOk

    const overlayPath = await buildOverlayPattern()
    const overlayMeta = await sharp(overlayPath).metadata()
    const overlayStats = await sharp(overlayPath).stats()
    const alphaMax = overlayStats.channels[3].max
    const overlayOk = overlayMeta.width === 128 && overlayMeta.height === 128 && overlayMeta.channels === 4 && alphaMax > 150 && alphaMax < 190
    console.log(`overlayPattern.png: ${overlayMeta.width}x${overlayMeta.height} channels=${overlayMeta.channels} alphaMax=${alphaMax} ${overlayOk ? 'OK' : '!! CHECK'}`)
    allOk = allOk && overlayOk

    console.log(allOk ? 'All intro assets generated.' : 'Some checks failed — inspect output above.')
    process.exitCode = allOk ? 0 : 1
}

run()
