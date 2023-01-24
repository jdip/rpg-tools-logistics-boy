import type { ModuleData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs'
import { name as moduleId } from './module.json'
import BuildInterface from './build-interface'
import './style.css'

interface LogisticsBoy extends Game.ModuleData<ModuleData> {
  buildInterface: BuildInterface
}

let module: LogisticsBoy

Hooks.once('init', () => {
  console.log(`Initializing ${moduleId}`)

  module = (game as Game).modules.get(moduleId) as LogisticsBoy
  module.buildInterface = new BuildInterface()
})

Hooks.on('renderRollTableDirectory', (_: Application, html: JQuery) => {
  const button = $(
    `<button id="open-logistics-boy-app" class="cc-sidebar-button" type="button">
            <img class="logistics-boy-icon" alt="Logistics Boy Icon" width="14" height="14" src="/modules/rpg-tools-logistics-boy/hand-truck-black.svg">
            <span>LogisticsBoy</span>
            </button>`
  )
  button.on('click', () => {
    module.buildInterface.render(true)
  })
  html.find('.directory-header .action-buttons').append(button)
})
