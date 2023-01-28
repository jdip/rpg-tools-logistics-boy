import './styles/interface.css'
import { name as moduleId } from './module.json'
import { itemGroupTests } from './item-groupings'
import { createRollTables } from './create-roll-tables'

export default class Interface extends Application {
  private static readonly _buttonStates: BuildInterfaceButtonState[] = [
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
      id: `${moduleId}-build-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${moduleId}/templates/rt-log-boy-interface.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (options?: ApplicationOptions) {
    super(options)
    this._processes = []
    this._status = 'initialized'
  }

  private _status: BuildInterfaceStatus

  status (): BuildInterfaceStatus {
    return this._status
  }

  private async _setStatus (newStatus: BuildInterfaceStatus): Promise<void> {
    this._status = newStatus
    await this.render()
  }

  private _processes: BuildInterfaceProcess[]

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

  private _buttonState (): BuildInterfaceButtonState {
    return (Interface._buttonStates.find(button => button.status === this.status()) as BuildInterfaceButtonState)
  }

  override getData (): BuildInterfaceData {
    return {
      status: this.status(),
      availableGroups: itemGroupTests,
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
