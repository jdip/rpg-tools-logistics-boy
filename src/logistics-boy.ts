import type { ModuleData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs'
import { name as moduleId } from './module.json'
import RTLogBoyInterface from './rt-log-boy-interface'
import './style.css'

interface LogisticsBoy extends Game.ModuleData<ModuleData> {
  interface: RTLogBoyInterface
}

let module: LogisticsBoy

Hooks.once('init', () => {
  module = (game as Game).modules.get(moduleId) as LogisticsBoy
  module.interface = new RTLogBoyInterface()
})

Hooks.on('renderRollTableDirectory', (_: Application, html: JQuery) => {
  const button = $(
    `<button id="rt-log-boy-open-app" class="cc-sidebar-button" type="button">
            <img class="rt-log-boy-open-app-icon" alt="Logistics Boy Icon" width="14" height="14" src="/modules/rpg-tools-logistics-boy/hand-truck-black.svg">
            <span>LogisticsBoy</span>
            </button>`
  )
  button.on('click', () => {
    module.interface.render(true)
  })
  html.find('.directory-header .action-buttons').append(button)
})
