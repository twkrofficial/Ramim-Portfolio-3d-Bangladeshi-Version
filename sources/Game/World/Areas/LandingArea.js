import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json'

export class LandingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters()
    {
        // Original "BRUNO SIMON" letters, kept out of the scene (see Areas.js), used only to measure the layout
        // Their positions are still local to the landing model since they were never auto-added
        const originals = this.references.items.get('letters')

        const quaternion = originals[0].quaternion.clone()
        const direction = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion)
        const anchor = originals[0].position

        let minProjection = Infinity
        let maxProjection = - Infinity
        let letterHeight = Infinity
        let centerY = 0

        for(const original of originals)
        {
            if(!original.geometry.boundingBox)
                original.geometry.computeBoundingBox()

            const boundingBox = original.geometry.boundingBox
            const projection = original.position.clone().sub(anchor).dot(direction)
            minProjection = Math.min(minProjection, projection - boundingBox.max.x)
            maxProjection = Math.max(maxProjection, projection + boundingBox.max.x)
            letterHeight = Math.min(letterHeight, boundingBox.max.y - boundingBox.min.y)
            centerY += original.position.y
        }

        centerY /= originals.length

        const sampleGeometry = originals[0].geometry
        const letterDepth = sampleGeometry.boundingBox.max.z - sampleGeometry.boundingBox.min.z
        const paletteUv = new THREE.Vector2().fromBufferAttribute(sampleGeometry.attributes.uv, 0)
        const mass = originals[0].userData.mass ?? 0.2

        const lineCenter = anchor.clone()
            .add(direction.clone().multiplyScalar((minProjection + maxProjection) * 0.5))
        lineCenter.y = centerY
        lineCenter.add(this.model.position) // To world space

        // Build the new name, matching the original letters' size, depth and palette color
        const font = new Font(helvetikerBold)
        const text = 'RAMIM AHMED'
        const bevelThickness = 0.03
        const bevelSize = 0.02
        const tracking = 0.15
        const wordGap = 0.4

        const probe = new TextGeometry('E', { font, size: 1, depth: 1, curveSegments: 8, bevelEnabled: false })
        probe.computeBoundingBox()
        const capHeight = probe.boundingBox.max.y - probe.boundingBox.min.y
        probe.dispose()

        const fontSize = (letterHeight - bevelSize * 2) / capHeight

        const letters = []
        let cursor = 0

        for(const character of text)
        {
            if(character === ' ')
            {
                cursor += wordGap
                continue
            }

            const geometry = new TextGeometry(character, {
                font,
                size: fontSize,
                depth: letterDepth - bevelThickness * 2,
                curveSegments: 8,
                bevelEnabled: true,
                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelSegments: 3
            })
            geometry.center()
            geometry.computeBoundingBox()

            // Flatten UVs to a single point so the palette texture reads as one solid color,
            // exactly like the original letters
            const uvAttribute = geometry.attributes.uv
            for(let i = 0; i < uvAttribute.count; i++)
                uvAttribute.setXY(i, paletteUv.x, paletteUv.y)

            const width = geometry.boundingBox.max.x * 2
            letters.push({ geometry, halfExtents: geometry.boundingBox.max.clone(), offset: cursor + width * 0.5 })
            cursor += width + tracking
        }

        const totalWidth = cursor - tracking
        const paletteMaterial = this.game.materials.getFromName('palette')

        for(const letter of letters)
        {
            const mesh = new THREE.Mesh(letter.geometry, paletteMaterial)
            const position = lineCenter.clone()
                .add(direction.clone().multiplyScalar(letter.offset - totalWidth * 0.5))

            this.game.objects.add(
                {
                    model: mesh,
                    updateMaterials: false
                },
                {
                    type: 'dynamic',
                    position: position,
                    rotation: quaternion,
                    sleeping: true,
                    mass: mass,
                    contactThreshold: 5,
                    onCollision: (force, hitPosition) =>
                    {
                        this.game.audio.groups.get('hitBrick').playRandomNext(force, hitPosition)
                    },
                    colliders: [ { shape: 'cuboid', parameters: [ letter.halfExtents.x, letter.halfExtents.y, letter.halfExtents.z ] } ]
                }
            )
        }
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x7A6E62),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}