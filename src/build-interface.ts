import './styles/build-interface.css'
import { name as moduleId } from './module.json'
import { availableTables, createRollTables } from './create-roll-tables'

export default class BuildInterface extends Application {
  constructor (options?: ApplicationOptions) {
    super(options)
    this._processes = []
    this._status = 'initialized'
  }

  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${moduleId}-build-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${moduleId}/templates/build-interface.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  private _status: BuildInterfaceStatus

  status (): BuildInterfaceStatus {
    return this._status
  }

  private _setStatus (newStatus: BuildInterfaceStatus): void {
    this._status = newStatus
    this.render()
  }

  private _processes: BuildInterfaceProcess[]

  startProcess (name: string): void {
    this._processes.push({ name, icon: 'fa-cog', iconAnimation: 'fa-spin' })
    this.render()
  }

  stopProcess (name: string): void {
    const process = this._processes.find(p => p.name === name)
    if (process == null) throw new Error('Process does not exist')
    process.icon = 'fa-check'
    process.iconAnimation = undefined
    this.render()
  }

  private _clearProcesses (): void {
    this._processes = []
  }

  private _buttonProps (): BuildInterfaceButtonProps {
    switch (this.status()) {
      case 'initialized':
        return {
          title: 'Create Roll Tables',
          action: 'create-roll-tables',
          icon: 'fa-random'
        }
      case 'running':
        return {
          title: 'Cancel',
          action: 'cancel',
          icon: 'fa-cancel'
        }
      case 'canceling':
        return {
          title: 'Canceling',
          action: '',
          icon: 'fa-spinner',
          iconAnimation: 'fa-spin'
        }
      case 'aborted':
        return {
          title: 'Back',
          action: 'back',
          icon: 'fa-arrow-left'
        }
      case 'complete':
        return {
          title: 'Back',
          action: 'back',
          icon: 'fa-arrow-left'
        }
    }
  }

  override getData (): BuildInterfaceData {
    return {
      status: this.status(),
      availableTables,
      processes: this._processes,
      button: this._buttonProps()
    }
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    console.log('activating listeners')
    super.activateListeners(html)
    html
      .find('#rpg-tools-logistics-boy-button')
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
      case 'create-roll-tables':
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
    }
  }

  private async _createRollTables (): Promise<void> {
    this._setStatus('running')

    const inputs = $('#rpg-tools-logistics-boy-build-form input')
    const tables = inputs.toArray().filter(input => input instanceof HTMLInputElement).map(input => {
      return (input as HTMLInputElement).value
    }).slice(8)

    const result = await createRollTables(
      tables,
      this.startProcess.bind(this),
      this.stopProcess.bind(this),
      this.status.bind(this))
      ? 'complete'
      : 'aborted'
    setTimeout(() => { this._setStatus(result) }, 1000)
    ui.notifications?.info(this.status())
  }

  private async _cancel (): Promise<void> {
    if (this.status() === 'running') {
      this._setStatus('canceling')
      ui.notifications?.info('RPG.Tools - LogisticsBoy: Canceling roll table generation')
    } else {
      ui.notifications?.info('RPG.Tools - LogisticsBoy: Can\'t cancel roll table generation, not running')
    }
  }

  private async _back (): Promise<void> {
    this._clearProcesses()
    this._setStatus('initialized')
  }
}
