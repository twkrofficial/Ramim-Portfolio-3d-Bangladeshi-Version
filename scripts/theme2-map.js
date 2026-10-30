/**
 * Theme 2 "Aurum Dusk" map generator.
 * Regrades the theme-1 map renders (backed up in resources/theme1-backup/)
 * and composites a designed overlay: gold frame, corner ticks, subtle grid,
 * compass rose, title cartouche and vignette.
 *
 * Usage: node scripts/theme2-map.js
 */
import sharp from 'sharp'

const SIZE = 1024
const GOLD = '#e9c68f'

const overlaySvg = (variant) =>
{
    const lineAlpha = variant === 'night' ? 0.10 : 0.07
    const frameAlpha = variant === 'night' ? 0.9 : 0.8

    // Subtle coordinate grid, skipping the frame band
    let grid = ''
    for(let i = 1; i < 8; i++)
    {
        const p = i * (SIZE / 8)
        grid += `<line x1="${p}" y1="20" x2="${p}" y2="${SIZE - 20}" stroke="#ffffff" stroke-opacity="${lineAlpha}" stroke-width="1"/>`
        grid += `<line x1="20" y1="${p}" x2="${SIZE - 20}" y2="${p}" stroke="#ffffff" stroke-opacity="${lineAlpha}" stroke-width="1"/>`
    }

    // Edge tick marks every 64px
    let ticks = ''
    for(let i = 1; i < 16; i++)
    {
        const p = i * (SIZE / 16)
        ticks += `<line x1="${p}" y1="10" x2="${p}" y2="${i % 2 ? 16 : 22}" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>`
        ticks += `<line x1="${p}" y1="${SIZE - 10}" x2="${p}" y2="${SIZE - (i % 2 ? 16 : 22)}" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>`
        ticks += `<line x1="10" y1="${p}" x2="${i % 2 ? 16 : 22}" y2="${p}" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>`
        ticks += `<line x1="${SIZE - 10}" y1="${p}" x2="${SIZE - (i % 2 ? 16 : 22)}" y2="${p}" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>`
    }

    // Corner L-accents
    const L = 46
    const corner = (x, y, sx, sy) => `
        <path d="M ${x + L * sx} ${y} L ${x} ${y} L ${x} ${y + L * sy}"
            fill="none" stroke="${GOLD}" stroke-opacity="${frameAlpha}" stroke-width="3"/>`

    return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
                <stop offset="62%" stop-color="#0a0814" stop-opacity="0"/>
                <stop offset="100%" stop-color="#0a0814" stop-opacity="${variant === 'night' ? 0.5 : 0.38}"/>
            </radialGradient>
        </defs>

        <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="url(#vignette)"/>
        ${grid}
        ${ticks}

        <!-- Double frame -->
        <rect x="10" y="10" width="${SIZE - 20}" height="${SIZE - 20}" fill="none" stroke="${GOLD}" stroke-opacity="${frameAlpha}" stroke-width="2"/>
        <rect x="20" y="20" width="${SIZE - 40}" height="${SIZE - 40}" fill="none" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="1"/>
        ${corner(10, 10, 1, 1)}
        ${corner(SIZE - 10, 10, -1, 1)}
        ${corner(10, SIZE - 10, 1, -1)}
        ${corner(SIZE - 10, SIZE - 10, -1, -1)}

        <!-- Compass rose -->
        <g transform="translate(936, 88)">
            <circle r="40" fill="#14111d" fill-opacity="0.72"/>
            <circle r="40" fill="none" stroke="${GOLD}" stroke-opacity="0.9" stroke-width="2"/>
            <circle r="32" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="1"/>
            <path d="M 0 -26 L 7 8 L 0 3 L -7 8 Z" fill="${GOLD}"/>
            <path d="M 0 26 L 5 6 L 0 9 L -5 6 Z" fill="${GOLD}" fill-opacity="0.45"/>
            <line x1="-32" y1="0" x2="-22" y2="0" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.5"/>
            <line x1="22" y1="0" x2="32" y2="0" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.5"/>
            <text x="0" y="-44" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="${GOLD}" fill-opacity="0.95">N</text>
        </g>

        <!-- Title cartouche -->
        <g transform="translate(88, 936)">
            <rect x="-44" y="-26" width="380" height="52" fill="#14111d" fill-opacity="0.78"/>
            <rect x="-44" y="-26" width="380" height="52" fill="none" stroke="${GOLD}" stroke-opacity="0.75" stroke-width="1.5"/>
            <rect x="-38" y="-20" width="368" height="40" fill="none" stroke="${GOLD}" stroke-opacity="0.25" stroke-width="1"/>
            <text x="146" y="-2" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="21" letter-spacing="6" fill="#ffffff" fill-opacity="0.96">RAMIM AHMED</text>
            <text x="146" y="16" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="11" letter-spacing="8" fill="${GOLD}" fill-opacity="0.9">— WORLD MAP —</text>
        </g>
    </svg>`
}

const grade = (variant) =>
{
    const source = `resources/theme1-backup/map-${variant}.png`

    let image = sharp(source)

    if(variant === 'day')
        image = image
            .modulate({ saturation: 0.88, brightness: 0.97, hue: -5 })
            .linear(1.06, -8)
    else
        image = image
            .modulate({ saturation: 0.85, brightness: 0.94, hue: 4 })
            .linear(1.08, -6)

    return image
        .composite([ { input: Buffer.from(overlaySvg(variant)), top: 0, left: 0 } ])
}

for(const variant of [ 'day', 'night' ])
{
    const graded = grade(variant)
    await graded.clone().png({ compressionLevel: 9 }).toFile(`static/ui/map/map-${variant}.png`)
    await graded.clone().webp({ quality: 88 }).toFile(`static/ui/map/map-${variant}.webp`)
    console.log(`map-${variant} written (png + webp)`)
}
