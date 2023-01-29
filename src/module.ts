import * as moduleInfo from './module.json'
import Interface from './interface'
import { getUniqueItemSources } from './config/sources'
import { registerSettings } from './config/settings'

interface Module {
  id: string
  active: boolean
  esmodules: Set<string>
  scripts: Set<string>
  flags: Record<string, Record<string, unknown>>
  title: string
  compatibility: {
    minimum?: string
    verified?: string
    maximum?: string
  }
  interface: Interface
}

let module: Module

Hooks.once('init', () => {
  module = game.modules.get(moduleInfo.name) as Module
  module.interface = new Interface()
})

Hooks.once('ready', async () => {
  await getUniqueItemSources()
  await registerSettings()
})
Hooks.on('renderRollTableDirectory', (_: Application, html: JQuery) => {
  const button = $(
    `<button id="rt-log-boy-open-app-button" class="cc-sidebar-button" type="button">
       <img class="rt-log-boy-open-app-icon" alt="Logistics Boy Icon" width="14" height="14" src="/modules/rpg-tools-logistics-boy/svg/hand-truck-black.svg">
       <span>LogisticsBoy</span>
     </button>`
  )
  button.on('click', () => {
    const result = module.interface.render(true)
    if (result instanceof Promise) {
      result.catch(err => {
        console.error(err)
      })
    }
  })
  html.find('.directory-header .action-buttons').append(button)
})
