import { Game } from '../../Game.js'
import { AltarArea } from './AltarArea.js'
import { CookieArea } from './CookieArea.js'
import { LandingArea } from './LandingArea.js'
import { ProjectsArea } from './ProjectsArea.js'
import { LabArea } from './LabArea.js'
import { CareerArea } from './CareerArea.js'
import { SocialArea } from './SocialArea.js'
import { ToiletArea } from './ToiletArea.js'
import { BowlingArea } from './BowlingArea.js'
import { CircuitArea } from './CircuitArea.js'
import { BehindTheSceneArea } from './BehindTheSceneArea.js'
import { AchievementsArea } from './AchievementsArea.js'
import { TimeMachineArea } from './TimeMachineArea.js'
import { EasterArea } from './EasterArea.js'

export class Areas
{
    constructor()
    {
        this.game = Game.getInstance()

        const list = [
            [ 'achievements', AchievementsArea ],
            [ 'altar', AltarArea ],
            [ 'behindTheScene', BehindTheSceneArea ],
            [ 'bowling', BowlingArea ],
            [ 'career', CareerArea ],
            [ 'circuit', CircuitArea ],
            [ 'cookie', CookieArea ],
            [ 'lab', LabArea ],
            [ 'landing', LandingArea ],
            [ 'projects', ProjectsArea ],
            [ 'social', SocialArea ],
            [ 'toilet', ToiletArea ],
            [ 'timeMachine', TimeMachineArea ],
        ]

        const model = [...this.game.resources.areasModel.scene.children]

        // No Discord account => remove the logo prop from the social area
        const socialModel = model.find(child => child.name.startsWith('social'))
        const discordProp = socialModel?.children.find(child => child.name.startsWith('discord'))
        if(discordProp)
            discordProp.removeFromParent()

        // The original name letters are skipped and rebuilt as "RAMIM AHMED" (see LandingArea.setLetters)
        const landingModel = model.find(child => child.name.startsWith('landing'))
        for(const child of landingModel.children)
        {
            if(child.name.startsWith('refLetters'))
            {
                child.userData.preventAutoAdd = true
                child.name = child.name.replace(/PhysicalDynamic/i, '')
            }
        }

        for(const child of model)
        {
            for(const [ name, AreaClass ] of list)
            {
                if(child.name.startsWith(name))
                    this[name] = new AreaClass(child)
            }
        }

        // // Test how many areas are visible
        // this.game.ticker.events.on('tick', () =>
        // {
        //     let i = 0
        //     if(this.achievements.frustum.isIn)
        //         i++
        //     if(this.altar.frustum.isIn)
        //         i++
        //     if(this.behindTheScene.frustum.isIn)
        //         i++
        //     if(this.bowling.frustum.isIn)
        //         i++
        //     if(this.career.frustum.isIn)
        //         i++
        //     if(this.circuit.frustum.isIn)
        //         i++
        //     if(this.cookie.frustum.isIn)
        //         i++
        //     if(this.lab.frustum.isIn)
        //         i++
        //     if(this.landing.frustum.isIn)
        //         i++
        //     if(this.projects.frustum.isIn)
        //         i++
        //     if(this.social.frustum.isIn)
        //         i++
        //     if(this.toilet.frustum.isIn)
        //         i++

        //     console.log(i)
        // }, 6)
    }
}