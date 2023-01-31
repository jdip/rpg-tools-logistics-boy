import { thisSystem, moduleInfo } from '../module'
import { pf2eItemGroupTests } from '../roll-tables/pf2e-item-groupings'
import { dnd5eItemGroupTests } from '../roll-tables/dnd5e-item-groupings'
import { pf2eCreateRollTables } from '../roll-tables/pf2e-create-roll-tables'
import { dnd5eCreateRollTables } from '../roll-tables/dnd5e-create-roll-tables'

export default class MainInterface extends Application {
  private static readonly _buttonStates: MainInterfaceButtonState[] = [
    {
      status: 'initialized',
      title: 'Create Rollable Tables',
      action: 'create-rollable-tables',
      disabled: false,
      icon: 'fa-random'
    },
    {
      status: 'running',
      title: 'Cancel',
      action: 'cancel',
      disabled: false,
      icon: 'fa-cancel'
    },
    {
      status: 'canceling',
      title: 'Canceling',
      action: '',
      disabled: true,
      icon: 'fa-cancel'
    },
    {
      status: 'aborted',
      title: 'Back',
      action: 'back',
      disabled: false,
      icon: 'fa-arrow-left'
    },
    {
      status: 'complete',
      title: 'Back',
      action: 'back',
      disabled: false,
      icon: 'fa-arrow-left'
    }
  ]

  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${moduleInfo.name}-main-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${moduleInfo.name}/templates/main-interface.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (system: ValidSystems, options?: ApplicationOptions) {
    super(options)
    this._system = system
    this._processes = []
    this._status = 'initialized'
  }

  private readonly _system: ValidSystems
  private _status: MainInterfaceStatus
  status (): MainInterfaceStatus {
    return this._status
  }

  private async _setStatus (newStatus: MainInterfaceStatus): Promise<void> {
    this._status = newStatus
    await this.render()
  }

  private _processes: MainInterfaceProcess[]

  async startProcess (name: string): Promise<void> {
    this._processes.push({ name, icon: 'fa-cog', iconAnimation: 'fa-spin' })
    await this.render(true)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  async stopProcess (name: string): Promise<void> {
    const process = this._processes.find(p => p.name === name)
    if (process == null) throw new Error('Process does not exist')
    process.icon = 'fa-check'
    process.iconAnimation = undefined
    await this.render(true)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private _clearProcesses (): void {
    this._processes = []
  }

  private _doneTimer: ReturnType<typeof setTimeout> | undefined

  private _setDoneTimer (callback: () => void, delay: number): void {
    if (this._doneTimer !== undefined) {
      clearTimeout(this._doneTimer)
      this._doneTimer = undefined
    }
    this._doneTimer = setTimeout(callback, delay)
  }

  private _buttonState (): MainInterfaceButtonState {
    return (MainInterface._buttonStates.find(button => button.status === this.status()) as MainInterfaceButtonState)
  }

  override getData (): MainInterfaceData {
    return {
      moduleInfo,
      status: this.status(),
      availableGroups: thisSystem === 'dnd5e' ? dnd5eItemGroupTests : pf2eItemGroupTests,
      processes: this._processes,
      button: this._buttonState()
    }
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    super.activateListeners(html)
    html
      .find('.rt-log-boy-action')
      .on('click', (event: JQuery.TriggeredEvent) => {
        this._onClickFormButton(event)
          .catch(err => {
            console.error(err)
          })
      })
  }

  private async _onClickFormButton (event: JQuery.TriggeredEvent): Promise<void> {
    event.preventDefault()
    const button = (event.target.parentElement.tagName === 'BUTTON'
      ? event.target.parentElement
      : event.target) as HTMLElement

    const action = button.dataset.action
    switch (action) {
      case 'create-rollable-tables':
        await this._createRollTables()
        break
      case 'cancel':
        await this._cancel()
        break
      case 'back':
        await this._back()
        break
      case 'complete':
        await this._back()
        break
      case 'select-all':
        await this._selectAll()
        break
      case 'select-none':
        await this._selectNone()
        break
    }
  }

  private async _createRollTables (): Promise<void> {
    const inputs = $('#rt-log-boy-build-form input')
    const tables = inputs.toArray().filter(input => input instanceof HTMLInputElement && input.checked).map(input => {
      return (input as HTMLInputElement).value
    })
    if (tables.length > 0) {
      await this._setStatus('running')
      const createRollTables = this._system === 'dnd5e' ? dnd5eCreateRollTables : pf2eCreateRollTables
      const result = await createRollTables(
        tables,
        this.startProcess.bind(this),
        this.stopProcess.bind(this),
        this.status.bind(this))
        ? 'complete'
        : 'aborted'

      this._setDoneTimer(() => {
        this._setStatus(result).then(() => {
          ui.notifications?.info(`RPG.Tools - LogisticsBoy: Execution ${this.status()}`)
        }).catch(err => {
          console.error(err)
          ui.notifications?.info('RPG.Tools - LogisticsBoy: Unexpected Error')
        })
      }, 250)
    } else {
      ui.notifications?.info('RPG.Tools - LogisticsBoy: Nothing to run, no tables selected')
    }
  }

  private async _cancel (): Promise<void> {
    if (this.status() === 'running') {
      await this._setStatus('canceling')
      ui.notifications?.info('RPG.Tools - LogisticsBoy: Canceling roll table generation')
    } else {
      ui.notifications?.info('RPG.Tools - LogisticsBoy: Can\'t cancel roll table generation, not running')
    }
  }

  private async _back (): Promise<void> {
    this._clearProcesses()
    await this._setStatus('initialized')
  }

  private async _selectAll (): Promise<void> {
    const inputs = $('#rt-log-boy-build-form input')
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = true
    })
  }

  private async _selectNone (): Promise<void> {
    const inputs = $('#rt-log-boy-build-form input')
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
  }
}
