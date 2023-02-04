import meta from './module.json'
import config from './config.json'
import { isValidSystem, isFoundryModule, reportError } from './helpers'
import { createSources } from './sources'
import { Ready } from './interfaces/ready'
import { Running } from './interfaces/running'
import { registerConfigSources } from './interfaces/config-sources'
import { renderRollTableDirectoryButton } from './ui/roll-table-directory-button'
import { PF2eTables } from './tables/pf2e-tables'

export class ThisModule implements RTLB.ThisModule {
  constructor (foundryModule: RTLB.FoundryModule) {
    if (!isValidSystem(game.system.id)) throw reportError('RTLB.InvalidGameSystem')
    this.module = foundryModule
    this.system = game.system.id
    this._status = 'initializing'
    this._interface = new Ready(this)
  }

  readonly module: RTLB.FoundryModule
  readonly system: RTLB.ValidSystems
  // @ts-expect-error: we are assigning in 'ready' hook
  private _sources: RTLB.Sources
  setSources (sources: RTLB.Sources): void { this._sources = sources }
  get sources (): RTLB.Sources { return this._sources }
  // @ts-expect-error: we are assigning in 'ready' hook
  private _tables: RTLB.Tables
  setTables (tables: RTLB.Tables): void { this._tables = tables }
  get tables (): RTLB.Tables { return this._tables }
  private _status: RTLB.ModuleStatus
  get status (): RTLB.ModuleStatus { return this._status }
  async setStatus (newStatus: RTLB.ModuleStatus, ...args: any[]): Promise<void> {
    const oldStatus = this._status
    this._status = newStatus
    if (oldStatus !== this._status) {
      if (this._interface !== undefined) await this._interface.close()
      switch (this._status) {
        case 'ready':
          this._interface = new Ready(this, ...args)
          break
        case 'running':
          this._interface = new Running(this, ...args)
          break
        default:
          throw reportError('RTLB.InvalidInterfaceStatus')
      }
      if (oldStatus !== 'initializing') {
        await this.render(true)
      }
    }
  }

  private _interface: Application
  get interface (): Application {
    return this._interface
  }

  async render (force?: boolean, options?: RenderOptions): Promise<void> {
    await this._interface.render(force, options)
  }
}

let main: ThisModule
let setupComplete = false
let readyComplete = false

Hooks.once('init', async () => {
  await loadTemplates(config.partials.map((template: string) => {
    return `modules/${meta.name}/templates/partials/${template}.hbs`
  }))
})
Hooks.once('setup', async () => {
  console.log(`${meta.title}: ${game.i18n.localize('RTLB.InitializingModule')}`)
  const foundryModule = game.modules.get(meta.name)
  if (!isFoundryModule(foundryModule)) throw reportError('RTLB.ModuleNotLoaded')
  main = new ThisModule(foundryModule)
  foundryModule.main = main
  registerConfigSources(foundryModule.main)
  setupComplete = true
})
Hooks.once('ready', async () => {
  if (!setupComplete) throw reportError('RTLB.ModuleNotSetup')
  switch (main.system) {
    case 'pf2e':
      main.setTables(await PF2eTables.create(main))
      break
    default:
      throw reportError('RTLB.InvalidGameSystem')
  }
  main.setSources(await createSources(main))
  await main.setStatus('ready')
  console.log(`${meta.title}: ${game.i18n.localize('RTLB.ModuleReady')}`)
  readyComplete = true
})
Hooks.on('renderRollTableDirectory', (_app: Application, html: JQuery) => {
  renderRollTableDirectoryButton(
    html,
    main,
    /* istanbul ignore next */
    () => readyComplete
  )
})
