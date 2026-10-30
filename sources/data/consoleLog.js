import * as THREE from 'three/webgpu'

const text = `
██████╗  █████╗ ███╗   ███╗██╗███╗   ███╗
██╔══██╗██╔══██╗████╗ ████║██║████╗ ████║
██████╔╝███████║██╔████╔██║██║██╔████╔██║
██╔══██╗██╔══██║██║╚██╔╝██║██║██║╚██╔╝██║
██║  ██║██║  ██║██║ ╚═╝ ██║██║██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝     ╚═╝

 █████╗ ██╗  ██╗███╗   ███╗███████╗██████╗
██╔══██╗██║  ██║████╗ ████║██╔════╝██╔══██╗
███████║███████║██╔████╔██║█████╗  ██║  ██║
██╔══██║██╔══██║██║╚██╔╝██║██╔══╝  ██║  ██║
██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═════╝

╔═ Hello ════════════════╗
║ Thanks for visiting — you curious developer, you!
║ I'm Ramim Ahmed, a software developer from Sylhet, Bangladesh.
║ I put my trust in Allah and build things for the web.
╚════════════════════════╝

╔═ Contact ══════════════╗
║ Mail      ⇒ Rramimahmedhome@gmail.com
║ GitHub    ⇒ https://github.com/ramimfaaz
║ Instagram ⇒ https://instagram.com/twkrofficial
║ Facebook  ⇒ https://facebook.com/twkrofficial
║ Threads   ⇒ https://www.threads.net/@twkrofficial
╚════════════════════════╝

╔═ Debug ════════════════╗
║ Add #debug to the URL and reload to access debug mode.
║ Press [V] to toggle the free camera.
╚════════════════════════╝

╔═ Stack ════════════════╗
║ Three.js (release: ${THREE.REVISION}) ⇒ https://threejs.org/
║ Rapier physics         ⇒ https://rapier.rs/
║ Original world by Bruno Simon ⇒ https://bruno-simon.com
╚════════════════════════╝
`

let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]
    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'
        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
