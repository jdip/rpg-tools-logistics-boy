import moduleInfo from './module.json'
import { Sources } from './sources'
import { Ready } from './interfaces/ready'
import { ConfigSources } from './interfaces/config-sources'
import { renderRollTableDirectoryButton } from './ui/roll-table-directory-button'

export class ThisModule implements RTLB.ThisModule {
  static isValidSystem (systemId: unknown): systemId is RTLB.ValidSystems {
    return systemId === 'pf2e' || systemId === 'dnd5e'
  }

  static isFoundryModule (moduleDocument: unknown): moduleDocument is RTLB.FoundryModule {
    return typeof moduleDocument === 'object' &&
      moduleDocument !== null &&
      Object.hasOwn(moduleDocument, 'id') &&
      (moduleDocument as { id: any }).id === moduleInfo.name
  }

  static Error (message: string, localize: boolean = true): Error {
    const errorMessage = localize ? game.i18n.localize(message) : message
    ui.notifications?.error(`${moduleInfo.title}: ${errorMessage}`)
    return new Error(`${moduleInfo.title}: ${errorMessage}`)
  }

  static getModule (): ThisModule {
    const foundryModule = game.modules.get(moduleInfo.name)
    if (!ThisModule.isFoundryModule(foundryModule)) throw ThisModule.Error('RTLB.ModuleNotLoaded')
    if (!(foundryModule.main instanceof ThisModule)) throw ThisModule.Error('RTLB.MainModuleUndefined')
    return foundryModule.main
  }

  static getSources (): RTLB.Sources {
    const module = ThisModule.getModule()
    return module.sources
  }

  static init (): void {
    Hooks.once('setup', async () => {
      console.log(`${moduleInfo.title}: ${game.i18n.localize('RTLB.InitializingModule')}`)
      const foundryModule = game.modules.get(moduleInfo.name)
      if (!ThisModule.isFoundryModule(foundryModule)) throw ThisModule.Error('RTLB.ModuleNotLoaded')
      foundryModule.main = new ThisModule(foundryModule)
      ConfigSources.registerSettings()
      ConfigSources.registerMenu()
    })
    Hooks.once('ready', async () => {
      const module = ThisModule.getModule()
      const sources = await Sources.create(module)
      module.setSources(sources)
      await module.setStatus('ready')
      console.log(`${moduleInfo.title}: ${game.i18n.localize('RTLB.ModuleReady')}`)
    })
    Hooks.on('renderRollTableDirectory', (_app: Application, html: JQuery) => {
      const foundryModule = game.modules.get(moduleInfo.name)
      if (!ThisModule.isFoundryModule(foundryModule)) throw ThisModule.Error('RTLB.ModuleNotLoaded')
      if (!(foundryModule.main instanceof ThisModule)) throw ThisModule.Error('RTLB.MainModuleUndefined')
      renderRollTableDirectoryButton(html, foundryModule.main)
    })
  }

  constructor (foundryModule: RTLB.FoundryModule) {
    if (!ThisModule.isValidSystem(game.system.id)) throw ThisModule.Error('RTLB.InvalidGameSystem')
    this.module = foundryModule
    this.system = game.system.id
    this._status = 'initializing'
    this._interface = new Ready(this)
  }

  readonly module: RTLB.FoundryModule
  readonly system: RTLB.ValidSystems
  // @ts-expect-error: we are assigning in 'ready' hook
  private _sources: RTLB.Sources
  setSources (sources: RTLB.Sources): void {
    this._sources = sources
  }

  get sources (): RTLB.Sources {
    return this._sources
  }

  private _status: RTLB.ModuleStatus

  get status (): RTLB.ModuleStatus {
    return this._status
  }

  async setStatus (newStatus: RTLB.ModuleStatus): Promise<void> {
    if (newStatus !== this._status) {
      this._status = newStatus
      switch (this._status) {
        case 'ready':
          this._interface = new Ready(this)
          break
        default:
          throw ThisModule.Error('RTLB.InvalidInterfaceStatus')
      }
      await this.render()
    }
  }

  private _interface: Application
  get interface (): Application {
    return this._interface
  }

  error (message: string, localize: boolean = true): Error {
    return ThisModule.Error(message, localize)
  }

  async render (force?: boolean, options?: RenderOptions): Promise<Application> {
    // eslint-disable-next-line @typescript-eslint/return-await
    return this._interface.render(force, options)
  }
}

ThisModule.init()
