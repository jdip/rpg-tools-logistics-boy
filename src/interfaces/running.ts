import meta from '../module.json'
import { activateButtons, getCommonData, type GetDataResults } from './helpers'
import { reportError } from '../helpers'

export class Running extends Application {
  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${meta.name}-running-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${meta.name}/templates/running.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (mod: RTLB.Main, tables: Array<[string, string]>) {
    super()
    this._module = mod
    if (!this._checktables(tables)) throw reportError('RTLB.Error.InvalidTablesSelected')
    this._selectedTables = tables
  }

  private readonly _module: RTLB.Main

  private readonly _selectedTables: Array<[string, string]>

  private _checktables (tables: Array<[string, string]>): boolean {
    if (tables === undefined || tables.length === 0) return false
    const groups = Object.keys(this._module.tables.definitions)
    for (const [group, table] of tables) {
      if (!groups.includes(group)) return false
      const groupTables = Object.keys(this._module.tables.definitions[group])
      if (!groupTables.includes(table)) return false
    }
    return true
  }

  async getData (): Promise<GetDataResults & {
    tables: Array<[string, string]>
    processes: Array<{ title: string, status: string }>
  }> {
    return {
      ...getCommonData(),
      tables: this._selectedTables,
      processes: [],
      buttons: []
    }
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    super.activateListeners(html)
    activateButtons(new Map([
    ]), html)
  }
}
