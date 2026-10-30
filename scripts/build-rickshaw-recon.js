// Recon dump for a GLB file: node tree, TRS, mesh bounds, materials, UV ranges.
// Usage: node scripts/build-rickshaw-recon.js <path-to-glb>
import fs from 'node:fs'

const path = process.argv[2] ?? 'static/vehicle/default.glb'
const buf = fs.readFileSync(path)

// GLB header
const magic = buf.readUInt32LE(0)
if(magic !== 0x46546C67) throw new Error('not a GLB')
const version = buf.readUInt32LE(4)
const total = buf.readUInt32LE(8)

// Chunks
let offset = 12
let json = null
let bin = null
while(offset < total)
{
    const chunkLength = buf.readUInt32LE(offset)
    const chunkType = buf.readUInt32LE(offset + 4)
    const chunkData = buf.subarray(offset + 8, offset + 8 + chunkLength)
    if(chunkType === 0x4E4F534A) json = JSON.parse(chunkData.toString('utf8'))
    else if(chunkType === 0x004E4942) bin = chunkData
    offset += 8 + chunkLength
}

console.log(`=== ${path} — GLB v${version}, ${total} bytes, bin chunk: ${bin ? bin.length : 0} bytes ===`)
console.log(`generator: ${json.asset?.generator}`)
console.log(`scenes: ${json.scenes?.length}, nodes: ${json.nodes?.length}, meshes: ${json.meshes?.length}, materials: ${json.materials?.length}, textures: ${json.textures?.length ?? 0}, images: ${json.images?.length ?? 0}, accessors: ${json.accessors?.length}`)

// Materials
console.log('\n--- MATERIALS ---')
json.materials?.forEach((m, i) =>
{
    const pbr = m.pbrMetallicRoughness ?? {}
    console.log(`[${i}] "${m.name}" baseColorFactor=${JSON.stringify(pbr.baseColorFactor)} baseColorTexture=${JSON.stringify(pbr.baseColorTexture)} metallic=${pbr.metallicFactor} rough=${pbr.roughnessFactor} emissive=${JSON.stringify(m.emissiveFactor)} doubleSided=${!!m.doubleSided} alphaMode=${m.alphaMode ?? 'OPAQUE'}`)
})

// Images
json.images?.forEach((img, i) =>
{
    console.log(`image[${i}] name="${img.name}" mime=${img.mimeType} bufferView=${img.bufferView} uri=${img.uri?.slice(0, 60)}`)
})

// Accessor reader (for UV inspection)
const componentSizes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const typeCounts = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }
function readAccessor(idx)
{
    const acc = json.accessors[idx]
    if(acc.bufferView === undefined) return []
    const bv = json.bufferViews[acc.bufferView]
    const start = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
    const n = typeCounts[acc.type]
    const out = []
    const stride = bv.byteStride ?? componentSizes[acc.componentType] * n
    for(let i = 0; i < acc.count; i++)
    {
        const vals = []
        for(let c = 0; c < n; c++)
        {
            const at = start + i * stride + c * componentSizes[acc.componentType]
            let v
            if(acc.componentType === 5126) v = bin.readFloatLE(at)
            else if(acc.componentType === 5123) v = bin.readUInt16LE(at)
            else if(acc.componentType === 5125) v = bin.readUInt32LE(at)
            else if(acc.componentType === 5121) v = bin.readUInt8(at)
            else if(acc.componentType === 5122) v = bin.readInt16LE(at)
            else v = bin.readInt8(at)
            if(acc.normalized) v /= (acc.componentType === 5121 ? 255 : 65535)
            vals.push(v)
        }
        out.push(vals)
    }
    return out
}

// Meshes
console.log('\n--- MESHES ---')
json.meshes?.forEach((mesh, i) =>
{
    console.log(`mesh[${i}] "${mesh.name}"`)
    mesh.primitives.forEach((p, j) =>
    {
        const pos = json.accessors[p.attributes.POSITION]
        const mat = p.material !== undefined ? json.materials[p.material].name : '(none)'
        console.log(`  prim[${j}] mat="${mat}" verts=${pos.count} min=${JSON.stringify(pos.min?.map(v => +v.toFixed(3)))} max=${JSON.stringify(pos.max?.map(v => +v.toFixed(3)))} attrs=${Object.keys(p.attributes).join(',')}`)
        if(p.attributes.TEXCOORD_0 !== undefined)
        {
            const uvs = readAccessor(p.attributes.TEXCOORD_0)
            let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
            for(const [u, v] of uvs)
            {
                minU = Math.min(minU, u); maxU = Math.max(maxU, u)
                minV = Math.min(minV, v); maxV = Math.max(maxV, v)
            }
            // 128px palette: swatch = floor(u * 128 / 4)
            const swMin = Math.floor(minU * 128 / 4), swMax = Math.floor(maxU * 128 / 4)
            console.log(`    UV u=[${minU.toFixed(4)}, ${maxU.toFixed(4)}] v=[${minV.toFixed(4)}, ${maxV.toFixed(4)}] palette-swatch=[${swMin}..${swMax}]`)
        }
    })
})

// Node tree
console.log('\n--- NODE TREE ---')
const childSet = new Set()
json.nodes?.forEach(n => n.children?.forEach(c => childSet.add(c)))
function fmt(n)
{
    const bits = []
    if(n.translation) bits.push(`t=${JSON.stringify(n.translation.map(v => +v.toFixed(3)))}`)
    if(n.rotation) bits.push(`r=${JSON.stringify(n.rotation.map(v => +v.toFixed(3)))}`)
    if(n.scale) bits.push(`s=${JSON.stringify(n.scale.map(v => +v.toFixed(3)))}`)
    if(n.mesh !== undefined) bits.push(`mesh=${n.mesh}("${json.meshes[n.mesh].name}")`)
    return bits.join(' ')
}
function walk(idx, depth)
{
    const n = json.nodes[idx]
    console.log(`${'  '.repeat(depth)}[${idx}] "${n.name}" ${fmt(n)}`)
    n.children?.forEach(c => walk(c, depth + 1))
}
const roots = json.scenes[0].nodes
roots.forEach(r => walk(r, 0))

// Scene bbox (world, applying node transforms; rotation applied approximately via quaternion)
function quatApply(q, v)
{
    const [x, y, z] = v, [qx, qy, qz, qw] = q
    const ix = qw * x + qy * z - qz * y
    const iy = qw * y + qz * x - qx * z
    const iz = qw * z + qx * y - qy * x
    const iw = -qx * x - qy * y - qz * z
    return [
        ix * qw + iw * -qx + iy * -qz - iz * -qy,
        iy * qw + iw * -qy + iz * -qx - ix * -qz,
        iz * qw + iw * -qz + ix * -qy - iy * -qx,
    ]
}
let g = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
function walkBounds(idx, pt, pr, ps)
{
    const n = json.nodes[idx]
    const t = n.translation ?? [0, 0, 0]
    const r = n.rotation ?? [0, 0, 0, 1]
    const s = n.scale ?? [1, 1, 1]
    // compose with parent (T * R * S order per glTF)
    const cs = [ps[0] * s[0], ps[1] * s[1], ps[2] * s[2]]
    const rt = quatApply(pr, [t[0] * ps[0], t[1] * ps[1], t[2] * ps[2]])
    const ct = [pt[0] + rt[0], pt[1] + rt[1], pt[2] + rt[2]]
    // combined rotation = pr * r (hamilton)
    const cr = [
        pr[3] * r[0] + pr[0] * r[3] + pr[1] * r[2] - pr[2] * r[1],
        pr[3] * r[1] - pr[0] * r[2] + pr[1] * r[3] + pr[2] * r[0],
        pr[3] * r[2] + pr[0] * r[1] - pr[1] * r[0] + pr[2] * r[3],
        pr[3] * r[3] - pr[0] * r[0] - pr[1] * r[1] - pr[2] * r[2],
    ]
    if(n.mesh !== undefined)
    {
        for(const p of json.meshes[n.mesh].primitives)
        {
            const acc = json.accessors[p.attributes.POSITION]
            if(!acc.min || !acc.max) continue
            // 8 corners
            for(let corner = 0; corner < 8; corner++)
            {
                const v = [
                    (corner & 1 ? acc.max : acc.min)[0] * cs[0],
                    (corner & 2 ? acc.max : acc.min)[1] * cs[1],
                    (corner & 4 ? acc.max : acc.min)[2] * cs[2],
                ]
                const w = quatApply(cr, v)
                for(let a = 0; a < 3; a++)
                {
                    g.min[a] = Math.min(g.min[a], ct[a] + w[a])
                    g.max[a] = Math.max(g.max[a], ct[a] + w[a])
                }
            }
        }
    }
    n.children?.forEach(c => walkBounds(c, ct, cr, cs))
}
roots.forEach(r => walkBounds(r, [0, 0, 0], [0, 0, 0, 1], [1, 1, 1]))
console.log('\n--- SCENE BBOX (approx, TRS applied) ---')
console.log(`min=${JSON.stringify(g.min.map(v => +v.toFixed(3)))} max=${JSON.stringify(g.max.map(v => +v.toFixed(3)))}`)
console.log(`size=${JSON.stringify(g.max.map((v, i) => +(v - g.min[i]).toFixed(3)))}`)
