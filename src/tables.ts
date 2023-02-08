import { PF2e } from './groupings/pf2e'
import { deepFreeze, isKeyOf, isPathfinderItemArray, reportError } from './helpers'

export const createTables = (mod: RTLB.Main): RTLB.Tables => {
  switch (mod.system) {
    case 'pf2e': {
      return new PF2eTables(mod)
    }
    /* istanbul ignore next */
    default:
      throw reportError('RTLB.InvalidGameSystem')
  }
}

class AbstractTables implements RTLB.Tables {
  readonly definitions = {}
  availableTables: Record<string, RTLB.TableGroupDefinitions> = {}

  constructor (main: RTLB.Main) {
    /* istanbul ignore next */
    if (this.constructor === AbstractTables) {
      throw new Error('Can\'t instantiate abstract class!')
    }
    this._main = main
  }

  protected readonly _main: RTLB.Main

  async getFolder (): Promise<Folder> {
    const folder = game.folders.getName('LogisticsBoy') ?? await Folder.create({
      name: 'LogisticsBoy',
      type: 'RollTable'
    })
    if (folder === undefined) throw reportError('RTLB.Error.CouldNotFindOrCreateFolder')
    return folder
  }

  protected _shouldCancel = false

  cancel (): void {
    this._shouldCancel = true
  }

  async updateAvailableTables (): Promise<void> {
    const originalDefs = this._main.tables.definitions
    const resultDefs: Record<string, RTLB.TableGroupDefinitions> = {}
    const items = await this._main.sources.getItems()
    for (const [groupName, group] of Object.entries(originalDefs) as Array<[string, RTLB.TableGroupDefinitions]>) {
      const resultGroup: RTLB.TableGroupDefinitions = {}
      for (const [tableName, table] of Object.entries(group)) {
        const filteredItems = items.filter(item => table.test(item))
        if (filteredItems.length > 0) {
          resultGroup[tableName] = table
        }
      }
      if (Object.keys(resultGroup).length > 0) resultDefs[groupName] = resultGroup
    }
    this.availableTables = deepFreeze(resultDefs)
  }

  async build (group: string, table: string, _items: unknown[]): Promise<[RollTable, RTLB.TableGroupDefinition]> {
    if (!isKeyOf(this.definitions, group)) throw reportError('RTLB.Error.InvalidTableGroup')
    if (!isKeyOf(this.definitions[group], table)) throw reportError('RTLB.Error.InvalidTable')
    const folder = await this.getFolder()
    const definition = this.definitions[group][table] as RTLB.TableGroupDefinition
    const name = `${game.i18n.localize(definition.group)}: ${game.i18n.localize(definition.title)}`
    const tableCollection = (game.collections.get('RollTable') as RollTables)
    const rollTable: RollTable | undefined = tableCollection
      .find((t: RollTable) => t.name === name && t.folder === folder) ??
      await RollTable.create({
        name,
        folder
      } as unknown as foundry.data.RollTableSource)

    if (rollTable === undefined) throw reportError('RTLB.Error.CouldNotFindOrCreateTable')

    await rollTable.deleteEmbeddedDocuments(
      'TableResult',
      rollTable.results.map((item: Embedded<foundry.documents.BaseTableResult>) => {
        return (item as unknown as PathfinderItem).id
      })
    )
    return [rollTable, definition]
  }

  async buildAll (tables: Array<[string, string]>): Promise<void> {
    this._shouldCancel = false
    await this._main.setProgress(tables.map(t => ({
      group: t[0],
      table: t[1],
      definition: this.definitions[t[0] as keyof typeof this.definitions]?.[t[1]],
      status: 'pending'
    })))
    void this._main.interface.render()
    const items = await this._main.sources.getItems()

    for (const [group, table] of tables) {
      if (this._shouldCancel) {
        for (const p of this._main.progress) {
          if (p.status === 'pending') {
            await this._main.updateProgress({
              ...p,
              status: 'canceled'
            })
          }
          void this._main.interface.render()
        }
        await this._main.setStatus('aborted')
        void this._main.interface.render()
        return
      }
      await this._main.updateProgress({
        group,
        table,
        status: 'running'
      })
      void this._main.interface.render()
      await this.build(group, table, items)
      await this._main.updateProgress({
        group,
        table,
        status: 'done'
      })
      void this._main.interface.render()
    }
  }
}

class PF2eTables extends AbstractTables implements RTLB.Tables {
  readonly definitions = deepFreeze(PF2e)
  readonly rarityWeights: Record<string, number> = {
    common: 100,
    uncommon: 5,
    rare: 1,
    unique: 0
  }

  override async build (group: string, table: string, items: unknown[]): Promise<[RollTable, RTLB.TableGroupDefinition]> {
    const [rollTable, definition] = await super.build(group, table, items)
    if (!isPathfinderItemArray(items)) throw reportError('RTLB.Error.InvalidItemList')

    const filteredItems = items.filter(item => definition.test(item))
    await Promise.all(filteredItems.map(async (item: PathfinderItem) => {
      const rarity = item.system.traits?.rarity !== undefined ? item.system.traits.rarity : 'common'
      if (this.rarityWeights[rarity] === 0) return
      const level = item.system.level?.value !== undefined ? parseInt(item.system.level.value) : 0
      const levelFactor = (21 - level) * (21 - level)
      const weight = levelFactor * this.rarityWeights[rarity] *
        (isKeyOf(definition.adjustments, item.name) ? definition.adjustments[item.name] : 1)
      await rollTable.createEmbeddedDocuments('TableResult', [{
        type: 2,
        text: item.name,
        img: item.img,
        range: [1, 1],
        weight,
        documentCollection: 'pf2e.equipment-srd',
        documentId: item.id
      }])
    }))
    await rollTable.normalize()
    return [rollTable, definition]
  }
}
