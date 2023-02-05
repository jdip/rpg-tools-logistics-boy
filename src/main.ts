import meta from './module.json'
import config from './config.json'
import { isValidSystem, isFoundryModule, reportError } from './helpers'
import { createSources } from './sources'
import { MainInterface } from './interfaces/main'
import { registerConfigSources } from './interfaces/config-sources'
import { renderRollTableDirectoryButton } from './ui/roll-table-directory-button'
import { createTables } from './tables'

class Main implements RTLB.Main {
  constructor (foundryModule: RTLB.FoundryModule) {
    if (!isValidSystem(game.system.id)) throw reportError('RTLB.Error.InvalidGameSystem')
    this._status = 'initializing'
    this.module = foundryModule
    this.system = game.system.id
    this._sources = createSources(this)
    this._tables = createTables(this)
    this._interface = new MainInterface(this)
    this._progress = []
  }

  readonly module: RTLB.FoundryModule
  readonly system: RTLB.ValidSystems
  private readonly _sources: RTLB.Sources
  get sources (): RTLB.Sources { return this._sources }
  private readonly _tables: RTLB.Tables
  get tables (): RTLB.Tables { return this._tables }
  private _status: RTLB.MainStatus
  get status (): RTLB.MainStatus { return this._status }
  async setStatus (newStatus: RTLB.MainStatus): Promise<void> {
    const oldStatus = this._status
    this._status = newStatus
    if (oldStatus !== this._status) {
      if (this._interface !== undefined) await this._interface.close()
      switch (this._status) {
        case 'initialized':
          break
        case 'idle':
          break
        case 'running':
          this.setProgress([])
          await this._interface.render(true)
          break
        case 'canceling':
          this.tables.cancel()
          await this._interface.render(true)
          break
        case 'aborted':
          this.setProgress([])
          await this._interface.render(true)
          break
        case 'complete':
          this.setProgress([])
          await this._interface.render(true)
          break
        default:
          throw reportError('RTLB.Error.InvalidMainStatus')
      }
    }
  }

  get isReady (): boolean {
    return ['idle', 'running', 'canceling', 'aborted', 'complete'].includes(this.status)
  }

  private readonly _interface: Application
  get interface (): Application {
    return this._interface
  }

  private _progress: RTLB.ProgressItem[]
  get progress (): RTLB.ProgressItem[] {
    return this._progress
  }

  setProgress (progress: RTLB.ProgressItem[]): void {
    this._progress = progress
  }

  async updateProgress (progressItem: RTLB.ProgressItem): Promise<void> {
    const index = this._progress.findIndex(p => p.group === progressItem.group && p.table === progressItem.table)
    if (index === -1) throw reportError('RTLB.Error.InvalidProgressUpdate')
    this._progress[index].status = progressItem.status
    // await new Promise(r => setTimeout(r, 10))
  }
}

let main: Main

Hooks.once('init', async () => {
  await loadTemplates(config.partials.map((template: string) => {
    return `modules/${meta.name}/templates/partials/${template}.hbs`
  }))
})
Hooks.once('setup', async () => {
  console.log(`${meta.title}: ${game.i18n.localize('RTLB.InitializingModule')}`)
  const foundryModule = game.modules.get(meta.name)
  if (!isFoundryModule(foundryModule)) throw reportError('RTLB.Error.ModuleNotLoaded')
  main = new Main(foundryModule)
  foundryModule.main = main
  registerConfigSources(foundryModule.main)
  await main.setStatus('initialized')
})
Hooks.once('ready', async () => {
  if (main === undefined || main.status !== 'initialized') throw reportError('RTLB.Error.ModuleNotSetup')
  await main.sources.init()
  await main.setStatus('idle')
  console.log(`${meta.title}: ${game.i18n.localize('RTLB.ModuleReady')}`)
})
Hooks.on('renderRollTableDirectory', (_app: Application, html: JQuery) => {
  renderRollTableDirectoryButton(html, main)
})
