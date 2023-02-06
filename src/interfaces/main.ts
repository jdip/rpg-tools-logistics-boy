import meta from '../module.json'
import { activateButtons, getClickedWidget, getCommonData, type GetDataResults } from './helpers'
import { reportError } from '../helpers'

export class MainInterface extends Application {
  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${meta.name}-main-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${meta.name}/templates/main.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (main: RTLB.Main) {
    super()
    this._main = main
  }

  private readonly _main: RTLB.Main

  async getData (): Promise<GetDataResults & Record<string, any>> {
    const commonData = getCommonData()
    return {
      ...commonData,
      progress: this._main.progress,
      contentPartial: commonData.partials[this._main.status],
      tables: this._main.tables.definitions,
      buttons: [
        {
          title: 'RTLB.CreateTables',
          icon: 'fa-random',
          action: 'create-tables'
        }
      ]
    }
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    super.activateListeners(html)
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
  }

  private _updateCreateTablesButton (): void {
    const button = $<HTMLButtonElement>(`#${meta.name}-main-content button[data-action=create-tables]`)[0]
    if ($(`#${meta.name}-main-content input[type=checkbox]:checked`).length === 0) {
      button.disabled = true
      button.classList.add('disabled')
    } else {
      button.disabled = false
      button.classList.remove('disabled')
    }
  }

  private async _createTables (): Promise<void> {
    const tablesToBuild = await Promise.all($(`#${meta.name}-main-content form.${meta.name}-interface-form input`)
      .toArray()
      .filter(input => input instanceof HTMLInputElement && input.checked)
      .map(input => {
        return (input as HTMLInputElement).value
      })
      .map(async (table) => {
        return table.split('.')
      }))
    await this._main.setStatus('running', tablesToBuild)
  }

  private async _dropDetails (event: JQuery.TriggeredEvent): Promise<void> {
    const a = getClickedWidget(event)
    const group = a.dataset.group
    if (group === undefined) throw reportError('RTLB.Error.NoDataGroup')
    const $ul = $(`ul.${meta.name}-${group}`)[0]
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
    $(`ul.${meta.name}-details-list`).removeClass('display-none')
    const $i = $('a[data-action="drop-details"] i')
    $i.removeClass('fa-chevron-left')
    $i.addClass('fa-chevron-down')
  }

  private _collapseAll (): void {
    $(`ul.${meta.name}-details-list`).addClass('display-none')
    const $i = $('a[data-action="drop-details"] i')
    $i.addClass('fa-chevron-left')
    $i.removeClass('fa-chevron-down')
  }

  private async _selectAll (): Promise<void> {
    const inputs = $(`#${meta.name}-main-content form.${meta.name}-interface-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = true
    })
    this._updateCreateTablesButton()
    this._expandAll()
  }

  private async _selectDefault (): Promise<void> {
    const allInputs = $(`#${meta.name}-main-content form.${meta.name}-interface-form input`)
    allInputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
    const headingInputs = $(`#${meta.name}-main-content form.${meta.name}-interface-form li.${meta.name}-heading input`)
    headingInputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(i => {
      const input = (i as HTMLInputElement)
      input.checked = true
    })
    this._updateCreateTablesButton()
    this._collapseAll()
  }

  private async _selectNone (): Promise<void> {
    const inputs = $(`#${meta.name}-main-content form.${meta.name}-interface-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
    this._updateCreateTablesButton()
    this._collapseAll()
  }
}
