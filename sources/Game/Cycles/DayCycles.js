import * as THREE from 'three/webgpu'
import { Cycles } from './Cycles.js'

// Sonar Bangla day cycle — humid golden haze by day, warm navy-violet lantern night.
// day:   zenith #7fb2d9 -> dust-gold horizon #f2d9a0, sun #ffd98a, green-grey shadow
// dusk:  deep marigold horizon sinking into indigo-navy zenith
// night: warm navy #101b33 -> violet horizon #4a3b52, moonlit silver-navy light
// dawn:  rose-gold mist over pale hazy blue
const presets = {
    day:   { revealColor: new THREE.Color('#ffb347'), revealIntensity: 12, electricField: 0, temperature: 5, lightColor: new THREE.Color('#ffd98a'), lightIntensity: 1.2, shadowColor: new THREE.Color('#46604b'), fogColorA: new THREE.Color('#7fb2d9'), fogColorB: new THREE.Color('#f2d9a0'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    dusk:  { revealColor: new THREE.Color('#ffa23c'), revealIntensity: 5.55, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ffa85c'), lightIntensity: 1.2, shadowColor: new THREE.Color('#2e2a46'), fogColorA: new THREE.Color('#31456e'), fogColorB: new THREE.Color('#ee9c3c'), fogNearRatio: 0, fogFarRatio: 1.25 },
    night: { revealColor: new THREE.Color('#ffc24d'), revealIntensity: 10, electricField: 1, temperature: -7.5, lightColor: new THREE.Color('#4a5da8'), lightIntensity: 3.8, shadowColor: new THREE.Color('#101828'), fogColorA: new THREE.Color('#101b33'), fogColorB: new THREE.Color('#4a3b52'), fogNearRatio: -0.85, fogFarRatio: 1 },
    dawn:  { revealColor: new THREE.Color('#ffb077'), revealIntensity: 4.85, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ffc08c'), lightIntensity: 1.2, shadowColor: new THREE.Color('#564553'), fogColorA: new THREE.Color('#96aec6'), fogColorB: new THREE.Color('#f6c495'), fogNearRatio: 0.3, fogFarRatio: 1.25 },
}

export class DayCycles extends Cycles
{
    constructor()
    {
        const forcedProgress = import.meta.env.VITE_DAY_CYCLE_PROGRESS ? parseFloat(import.meta.env.VITE_DAY_CYCLE_PROGRESS) : null
        super('🕜 Day Cycles', 4 * 60, forcedProgress, false)
    }

    get presets()
    {
        return presets
    }

    getKeyframesDescriptions()
    {
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this, 'duration', { min: 1, max: 60 * 10, step: 1 })

            for(const presetKey in presets)
            {
                const preset = presets[presetKey]
                const presetsDebugPanel = this.debugPanel.addFolder({
                    title: presetKey,
                    expanded: true,
                })

                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.revealColor, 'revealColor')
                presetsDebugPanel.addBinding(preset, 'revealIntensity', { min: 0, max: 20, step: 0.001 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }

        return [
            [
                { properties: presets.day, stop: 0.0 }, // day
                { properties: presets.day, stop: 0.15 }, // day
                { properties: presets.dusk, stop: 0.25 }, // Dusk
                { properties: presets.night, stop: 0.35 }, // Night
                { properties: presets.night, stop: 0.6 }, // Night
                { properties: presets.dawn, stop: 0.8 }, // Dawn
                { properties: presets.day, stop: 0.9 }, // day
            ]
        ]
    }

    getIntervalDescriptions()
    {
        return [
            { name: 'night', start: 0.25, end: 0.7 },
            { name: 'deepNight', start: 0.35, end: 0.6 },
        ]
    }
}