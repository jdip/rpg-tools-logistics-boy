import { name as moduleId } from './module.json'
import Interface from './interface'
import './style.css'

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
  module = game.modules.get(moduleId) as Module
  module.interface = new Interface()
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
