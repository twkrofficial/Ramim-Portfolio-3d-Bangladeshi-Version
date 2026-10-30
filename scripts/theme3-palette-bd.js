/**
 * theme3-palette-bd.js — "Sonar Bangla" master palette generator
 *
 * Regenerates static/palette.png (128x4 RGB) with 24 flat swatches, each
 * 4px wide x 4px tall (full height). Swatch N covers columns [N*4, N*4+3].
 * Columns 96..127 are black (unused). Meshes sample this texture with
 * NearestFilter via baked UVs, so every pixel of a swatch must be flat.
 *
 * Role mapping preserves the value/hue family of Bruno's original palette
 * (light stays light, red stays red-family, ...) because hundreds of baked
 * mesh UVs point at fixed swatches. See resources/bd-theme/art-direction.md
 * section 2 and resources/bd-theme/recon-theming.md section (a).
 *
 * Usage: node scripts/theme3-palette-bd.js
 */

import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(__dirname, '..', 'static', 'palette.png')

const WIDTH = 128
const HEIGHT = 4
const SWATCH_WIDTH = 4

// [index, sonarBanglaHex, role (old hex)]
const swatches = [
    [0,  '#7a6e62', 'warm mud-grey structure shadow (was #706b88 grey-purple)'],
    [1,  '#f2e4c6', 'warm cream walls/wood light (was #e7d2a8)'],
    [2,  '#454d26', 'tea-shadow dark olive (was #4d4531)'],
    [3,  '#7c9ea6', 'haor water / cool accents (was #33a9d6 sky blue)'],
    [4,  '#c9cfd1', 'tin-roof silver (was #c9c5c6 light grey)'],
    [5,  '#4e3b2a', 'nouka tarred timber (was #403833 dark brown)'],
    [6,  '#464e52', 'wet slate / tin shadow (was #42464d)'],
    [7,  '#eac7a9', 'mud-plaster pale (was #ecc5b2 pale pink)'],
    [8,  '#f5a800', 'marigold (was #d2a018 gold)'],
    [9,  '#7cb342', 'tea-bush top green (was #7fa26c sage)'],
    [10, '#c98b62', 'sun-baked clay (was #d6946f terracotta light)'],
    [11, '#8f7c55', 'jute-stalk khaki (was #8c7a5e)'],
    [12, '#6fa544', 'warm terrain green (was #99a52f grass olive)'],
    [13, '#a29168', 'weathered thatch tan (was #9a916f grey-tan)'],
    [14, '#9c6b4a', 'laterite road / wood (was #a3633c)'],
    [15, '#dc7800', 'deep marigold orange (was #cf6a10)'],
    [16, '#e03422', 'rickshaw enamel red (was #d63a20 red-orange)'],
    [17, '#fbf0dd', 'warm off-white (was #fbe9e3)'],
    [18, '#f2b32a', 'scallop-trim gold amber (was #eda04f)'],
    [19, '#c8102e', 'panel red (was #a51132 crimson)'],
    [20, '#cb3d9f', 'rickshaw-art magenta (was #a55ce4 purple)'],
    [21, '#e86a9e', 'shapla pink (was #de6590)'],
    [22, '#20160f', 'ink near-black (was #1e0603)'],
    [23, '#fff9ef', 'alpana warm white (was #fff2e8)'],
]

const hexToRgb = (hex) =>
{
    const value = hex.replace('#', '')
    return [
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16),
    ]
}

const data = Buffer.alloc(WIDTH * HEIGHT * 3, 0) // unused columns stay #000000

for(const [index, hex] of swatches)
{
    const [r, g, b] = hexToRgb(hex)
    for(let y = 0; y < HEIGHT; y++)
    {
        for(let x = index * SWATCH_WIDTH; x < (index + 1) * SWATCH_WIDTH; x++)
        {
            const i = (y * WIDTH + x) * 3
            data[i] = r
            data[i + 1] = g
            data[i + 2] = b
        }
    }
}

await sharp(data, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

// Verify: read back and dump swatches
const { data: check, info } = await sharp(outputPath).raw().toBuffer({ resolveWithObject: true })

console.log(`Wrote ${outputPath} (${info.width}x${info.height}, ${info.channels} channels)`)

let ok = true
for(const [index, hex] of swatches)
{
    // check all 16 pixels of the swatch are flat and exact
    let flat = true
    const [r, g, b] = hexToRgb(hex)
    for(let y = 0; y < HEIGHT && flat; y++)
    {
        for(let x = index * SWATCH_WIDTH; x < (index + 1) * SWATCH_WIDTH; x++)
        {
            const i = (y * info.width + x) * info.channels
            if(check[i] !== r || check[i + 1] !== g || check[i + 2] !== b)
            {
                flat = false
                break
            }
        }
    }

    if(!flat)
        ok = false

    console.log(`swatch ${String(index).padStart(2)} x=[${index * 4}-${index * 4 + 3}] ${hex} ${flat ? 'OK' : 'MISMATCH'}`)
}

if(info.width !== WIDTH || info.height !== HEIGHT || info.channels !== 3)
{
    console.error('Unexpected output dimensions/channels')
    process.exit(1)
}

process.exit(ok ? 0 : 1)
