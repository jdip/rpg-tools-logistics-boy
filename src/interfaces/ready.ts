import meta from '../module.json'
import { activateButtons, getClickedWidget, getCommonData, type GetDataResults } from './helpers'
import { reportError } from '../helpers'
import ItemTestGroup = RTLB.ItemTestGroup

export class Ready extends Application {
  static override get defaultOptions (): ApplicationOptions {
    console.log('READY DEFAULTS')
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${meta.name}-ready-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${meta.name}/templates/ready.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (module: RTLB.ThisModule, options?: ApplicationOptions) {
    super(options)
    this._module = module
  }

  private readonly _module: RTLB.ThisModule

  async getData (): Promise<GetDataResults & { tables: Record<string, ItemTestGroup> }> {
    return {
      ...getCommonData(),
      tables: this._module.tables.definitions,
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
  }

  private async _createTables (): Promise<void> {
    const tablesToBuild = await Promise.all($(`#${meta.name}-ready-content form.${meta.name}-interface-form input`)
      .toArray()
      .filter(input => input instanceof HTMLInputElement && input.checked)
      .map(input => {
        return (input as HTMLInputElement).value
      })
      .map(async (table) => {
        return table.split('.')
      }))
    await this._module.setStatus('running', tablesToBuild)
  }

  private async _dropDetails (event: JQuery.TriggeredEvent): Promise<void> {
    const a = getClickedWidget(event)
    const group = a.dataset.group
    if (group === undefined) throw reportError('RTLB.NoDataGroup')
    console.log(`ul.${meta.name}-${group}`)
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
    const inputs = $(`#${meta.name}-ready-content form.${meta.name}-interface-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = true
    })
    this._expandAll()
  }

  private async _selectDefault (): Promise<void> {
    const allInputs = $(`#${meta.name}-ready-content form.${meta.name}-interface-form input`)
    allInputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
    const headingInputs = $(`#${meta.name}-ready-content form.${meta.name}-interface-form li.${meta.name}-heading input`)
    headingInputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(i => {
      const input = (i as HTMLInputElement)
      input.checked = true
    })
    this._collapseAll()
  }

  private async _selectNone (): Promise<void> {
    const inputs = $(`#${meta.name}-ready-content form.${meta.name}-interface-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
    this._collapseAll()
  }
}
