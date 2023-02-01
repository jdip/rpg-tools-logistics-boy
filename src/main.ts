import moduleInfo from './module.json'
import { Ready } from './interfaces/ready'
import { ConfigSources } from './interfaces/config-sources'
import { renderRollTableDirectoryButton } from './ui/roll-table-directory-button'

class ThisModule implements RTLB.ThisModule {
  private static _isValidSystem (systemId: unknown): systemId is RTLB.ValidSystems {
    return systemId === 'pf2e' || systemId === 'dnd5e'
  }

  private static _isFoundryModule (moduleDocument: unknown): moduleDocument is RTLB.FoundryModule {
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

  static init (): void {
    let main: ThisModule
    Hooks.once('setup', async () => {
      console.log(`${moduleInfo.title}: ${game.i18n.localize('RTLB.InitializingModule')}`)
      const foundryModule = game.modules.get(moduleInfo.name)
      if (!ThisModule._isFoundryModule(foundryModule)) throw ThisModule.Error('RTLB.ModuleNotLoaded')
      main = new ThisModule(foundryModule)
      foundryModule.main = main
      ConfigSources.registerSettings()
      ConfigSources.registerMenu()
    })
    Hooks.on('renderRollTableDirectory', (app: Application, html: JQuery) => {
      renderRollTableDirectoryButton(app, html, main)
    })
  }

  constructor (foundryModule: RTLB.FoundryModule) {
    if (!ThisModule._isValidSystem(game.system.id)) throw ThisModule.Error('RTLB.InvalidGameSystem')
    this.module = foundryModule
    this.system = game.system.id
    this._status = 'ready'
    this._interface = new Ready(this)
  }

  readonly module: RTLB.FoundryModule
  readonly system: RTLB.ValidSystems
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

  error (message: string, localize: boolean = true): Error {
    return ThisModule.Error(message, localize)
  }

  async render (force?: boolean, options?: RenderOptions): Promise<Application> {
    // eslint-disable-next-line @typescript-eslint/return-await
    return this._interface.render(force, options)
  }
}

ThisModule.init()
