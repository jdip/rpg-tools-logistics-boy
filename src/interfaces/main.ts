import meta from '../module.json'
import { activateButtons, getClickedWidget, getCommonData, type GetDataResults } from './helpers'
import { isArrayOfStringTuples, reportError, sleep } from '../helpers'

type MainAction = {
  title: string
  icon: string
  action: string
  disabled?: boolean
  method: (...args: any[]) => any
} | undefined
type MainActionMap = Record<RTLB.MainStatus, MainAction>

export class MainInterface extends Application {
  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'rtlb-main-interface',
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${meta.name}/templates/main.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (main: RTLB.Main) {
    super()
    this._main = main
    this._actionMap = {
      initializing: undefined,
      initialized: undefined,
      idle: {
        title: 'RTLB.CreateTables',
        action: 'create-tables',
        icon: 'fa-random',
        method: this._createTables.bind(this)
      },
      running: {
        title: 'RTLB.Cancel',
        action: 'cancel',
        icon: 'fa-cancel',
        method: this._cancel.bind(this)
      },
      canceling: {
        title: 'RTLB.Canceling',
        action: 'cancel',
        icon: 'fa-cancel',
        disabled: true,
        method: this._cancel.bind(this)
      },
      aborted: {
        title: 'RTLB.Back',
        action: 'back',
        icon: 'fa-arrow-left',
        method: this._back.bind(this)
      },
      complete: {
        title: 'RTLB.Back',
        action: 'back',
        icon: 'fa-arrow-left',
        method: this._back.bind(this)
      }
    }
    this._pendingIcon.src = `/modules/${meta.name}/svg/pending_20px.svg`
    this._runningIcon.src = `/modules/${meta.name}/svg/change_circle_20px.svg`
    this._cancelIcon.src = `/modules/${meta.name}/svg/cancel_20px.svg`
    this._doneIcon.src = `/modules/${meta.name}/svg/done_20px.svg`
  }

  private readonly _main: RTLB.Main
  private readonly _actionMap: MainActionMap

  private readonly _pendingIcon = new Image()
  private readonly _runningIcon = new Image()
  private readonly _cancelIcon = new Image()
  private readonly _doneIcon = new Image()

  async getData (): Promise<GetDataResults & Record<string, any>> {
    const commonData = getCommonData()
    const statusAction = this._actionMap[this._main.status]
    if (statusAction === undefined) throw reportError('RTLB.Error.NoActionDefined')
    return {
      ...commonData,
      icons: {
        pending: this._pendingIcon.src,
        running: this._runningIcon.src,
        canceling: this._cancelIcon.src,
        done: this._doneIcon.src
      },
      progress: this._main.progress,
      contentPartial: commonData.partials[this._main.status],
      tables: this._main.tables.availableTables,
      buttons: [
        {
          title: statusAction.title,
          icon: statusAction.icon,
          action: statusAction.action,
          disabled: statusAction.disabled ?? false
        }
      ]
    }
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    switch (this._main.status) {
      case 'idle': {
        activateButtons(new Map([
          ['create-tables', this._createTables.bind(this)],
          ['select-all', this._selectAll.bind(this)],
          ['select-default', this._selectDefault.bind(this)],
          ['select-none', this._selectNone.bind(this)],
          ['drop-details', this._dropDetails.bind(this)]
        ]), html)
        html
          .find('input[type=checkbox]')
          .on('change', (_event: JQuery.TriggeredEvent) => {
            this._updateCreateTablesButton()
          })
        break
      }
      case 'running':
        activateButtons(new Map([
          ['cancel', this._cancel.bind(this)]
        ]), html)
        break
      case 'aborted':
        activateButtons(new Map([
          ['back', this._back.bind(this)]
        ]), html)
        break
      case 'complete':
        activateButtons(new Map([
          ['back', this._back.bind(this)]
        ]), html)
        break
    }
  }

  private _updateCreateTablesButton (): void {
    const button = $<HTMLButtonElement>('#rtlb-main-content button[data-action=create-tables]')[0]
    if ($('#rtlb-main-content input[type=checkbox]:checked').length === 0) {
      button.disabled = true
      button.classList.add('disabled')
    } else {
      button.disabled = false
      button.classList.remove('disabled')
    }
  }

  private async _createTables (): Promise<void> {
    const tablesToBuild = await Promise.all($('#rtlb-main-content form.rtlb-interface-form input')
      .toArray()
      .filter(input => input instanceof HTMLInputElement && input.checked)
      .map(input => {
        return (input as HTMLInputElement).value
      })
      .map(async (table) => {
        return table.split('.')
      }))
    if (!isArrayOfStringTuples(tablesToBuild)) throw reportError('RTLB.Error.InvalidMainStatusArgs')
    await this._main.setStatus('running')
    await this._main.tables.buildAll(tablesToBuild)
    await sleep(500)
    if (this._main.status === 'running') {
      await this._main.setStatus('complete')
      void this.render()
    }
  }

  private async _dropDetails (event: JQuery.TriggeredEvent): Promise<void> {
    const a = getClickedWidget(event)
    const group = a.dataset.group
    if (group === undefined) throw reportError('RTLB.Error.NoDataGroup')
    const $ul = $(`ul.rtlb-${group}`)[0]
    const $i = $(a).find('i')[0]
    if ($ul.classList.contains('display-none')) {
      $ul.classList.remove('display-none')
      $i.classList.remove('fa-chevron-left')
      $i.classList.add('fa-chevron-down')
    } else {
      $ul.classList.add('display-none')
      $i.classList.add('fa-chevron-left')
      $i.classList.remove('fa-chevron-down')
    }
  }

  private _expandAll (): void {
    $('ul.rtlb-details-list').removeClass('display-none')
    const $i = $('a[data-action="drop-details"] i')
    $i.removeClass('fa-chevron-left')
    $i.addClass('fa-chevron-down')
  }

  private _collapseAll (): void {
    $('ul.rtlb-details-list').addClass('display-none')
    const $i = $('a[data-action="drop-details"] i')
    $i.addClass('fa-chevron-left')
    $i.removeClass('fa-chevron-down')
  }

  private async _selectAll (): Promise<void> {
    const inputs = $('#rtlb-main-content form.rtlb-interface-form input')
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = true
    })
    this._updateCreateTablesButton()
    this._expandAll()
  }

  private async _selectDefault (): Promise<void> {
    const allInputs = $('#rtlb-main-content form.rtlb-interface-form input')
    allInputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
    const headingInputs = $('#rtlb-main-content form.rtlb-interface-form li.rtlb-heading input')
    headingInputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(i => {
      const input = (i as HTMLInputElement)
      input.checked = true
    })
    this._updateCreateTablesButton()
    this._collapseAll()
  }

  private async _selectNone (): Promise<void> {
    const inputs = $('#rtlb-main-content form.rtlb-interface-form input')
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
    this._updateCreateTablesButton()
    this._collapseAll()
  }

  private async _cancel (): Promise<void> {
    await this._main.setStatus('canceling')
    this._main.tables.cancel()
    void this.render()
  }

  private async _back (): Promise<void> {
    await this._main.setStatus('idle')
    await this._main.setProgress([])
    void this.render()
  }

  private _renderDebounceTimeout: ReturnType<typeof setTimeout> | undefined
  private readonly _resolvers: Array<(...args: any[]) => any> = []

  render (force?: boolean, options?: RenderOptions): this | Promise<this> {
    return new Promise(resolve => {
      this._resolvers.push(resolve)
      if (this._renderDebounceTimeout !== undefined) {
        clearTimeout(this._renderDebounceTimeout)
        this._renderDebounceTimeout = undefined
      }
      this._renderDebounceTimeout = setTimeout(() => {
        const result = super.render(force, options)
        while (this._resolvers.length > 0) {
          const r = this._resolvers.shift()
          if (r !== undefined) {
            r(result)
          }
          this._renderDebounceTimeout = undefined
        }
      }, 25)
    })
  }
}
