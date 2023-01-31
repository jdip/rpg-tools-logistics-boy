import { preparePF2e } from './config/pf2e'
import { prepareDnD5e } from './config/dnd5e'

import moduleInfo from './module.json'
import RTLBMainInterface from './interfaces/main-interface'

let thisModule: FoundryModule
let thisSystem: ValidSystems
const isValidSystem = (systemId: unknown): systemId is ValidSystems => {
  return systemId === 'pf2e' || systemId === 'dnd5e'
}
Hooks.once('setup', () => {
  if (!isValidSystem(game.system.id)) {
    console.error(`${moduleInfo.title}: Invalid game system: ${game.system.id}`)
    return
  }
  thisModule = game.modules.get(moduleInfo.name) as FoundryModule
  thisSystem = game.system.id
  thisModule.interface = new RTLBMainInterface(game.system.id)
  if (thisSystem === 'pf2e') {
    preparePF2e()
  } else if (thisSystem === 'dnd5e') {
    prepareDnD5e()
  }
  Hooks.on('renderRollTableDirectory', (_: Application, html: JQuery) => {
    const button = $(
      `<button id="${moduleInfo.name}-open-main-interface-button" class="cc-sidebar-button" type="button">
       <img class="${moduleInfo.name}-open-main-interface-icon" alt="${moduleInfo.title} Icon" width="14" height="14" src="/modules/${moduleInfo.name}/svg/hand-truck-black.svg">
       <span>LogisticsBoy</span>
     </button>`
    )
    button.on('click', () => {
      thisModule.interface.render(true)
    })
    html.find('.directory-header .action-buttons').append(button)
  })
})

Hooks.once('ready', async () => {
  console.log('READY', game.system.id)
})

export { thisModule, thisSystem, moduleInfo }
