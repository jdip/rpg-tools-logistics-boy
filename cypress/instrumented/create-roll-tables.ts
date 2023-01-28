import { itemGroupTests } from './item-groupings'

const isGame = (game: Game | unknown): game is Game => {
  return game instanceof Game
}

const isFolders = (folders: Folders | unknown): folders is Folders => {
  return folders instanceof Folders
}

const allowedPacks = [
  'pathfinder-core-rulebook',
  'pathfinder-gamemastery-guide',
  'pathfinder-bestiary',
  'pathfinder-bestiary-2',
  'pathfinder-bestiary-3',
  'pathfinder-secrets-of-magic',
  'pathfinder-advanced-players-guide',
  'pathfinder-dark-archive',
  'pathfinder-book-of-the-dead',
  'Pathfinder Core Rulebook'
]

const rarityWeights: Record<string, number> = {
  common: 100,
  uncommon: 5,
  rare: 1,
  unique: 0
}

const buildTable = async (
  folder: Folder, name: string, items: PathfinderItem[], weightAdjustments: Record<string, number>
): Promise<void> => {
  if (!isGame(game)) throw new Error('game is not defined')
  const tableCollection = (game.collections.get('RollTable') as RollTables)
  const tbl: RollTable | undefined = tableCollection.find(
    (t: RollTable) => t.name === name && t.folder === folder
  ) ?? await RollTable.create({ name, folder } as unknown as foundry.data.RollTableSource)

  if (tbl === undefined) throw new Error('could not access/create rolltable')

  await tbl.deleteEmbeddedDocuments(
    'TableResult',
    tbl.results.map((item: Embedded<foundry.documents.BaseTableResult>) => (item as unknown as PathfinderItem).id)
  )

  await Promise.all(items.map(async (item: PathfinderItem) => {
    const rarity = item.system.traits?.rarity !== undefined ? item.system.traits.rarity : 'common'
    if (rarity === 'unique') return
    const level = item.system.level?.value !== undefined ? parseInt(item.system.level.value) : 0
    const levelFactor = (21 - level) * (21 - level)
    const weight = levelFactor * rarityWeights[rarity] * (Object.hasOwn(weightAdjustments, item.name) ? weightAdjustments[item.name] : 1)
    await tbl.createEmbeddedDocuments('TableResult', [{
      type: 2,
      text: item.name,
      img: item.img,
      range: [1, 1],
      weight,
      documentCollection: 'pf2e.equipment-srd',
      documentId: item.id
    }])
  }))
  await tbl.normalize()
}

const createRollTables = async (
  tables: string[],
  startProcess: BuildInterfaceProcessCallback,
  stopProcess: BuildInterfaceProcessCallback,
  status: () => BuildInterfaceStatus
): Promise<boolean> => {
  if (!isGame(game) || !isFolders(game.folders) || !game.ready) {
    ui.notifications?.error(
      'LogisticsBoy: game object does not appear to be initialized. Aborting Roll Table generation'
    )
    return false
  }
  const logisticsFolder = game.folders.getName('LogisticsBoy') ?? await Folder.create({
    name: 'LogisticsBoy',
    type: 'RollTable'
  })
  if (logisticsFolder === undefined) {
    ui.notifications?.error(
      'LogisticsBoy: could not find or create LogisticsBoy folder'
    )
    return false
  }

  const equipmentPack = game.packs.get('pf2e.equipment-srd')
  if (equipmentPack === undefined) {
    ui.notifications?.error(
      'LogisticsBoy: equipment compendium does not appear to be initialized. Aborting Roll Table generation'
    )
    return false
  }
  const documents = await equipmentPack.getDocuments()
  const items = new Set<PathfinderItem>()
  documents.forEach(i => {
    const item = (i as unknown as PathfinderItem)
    if (item.system?.source?.value === undefined) {
      console.log('no value', item)
      return
    }
    if (item.name.startsWith('Weapon Potency')) console.log('ITEM >>> ', item)
    items.add(item)
    console.log(allowedPacks)
    // if (allowedPacks.includes(item.system?.source?.value)) {
    //  items.add(item)
    // }
  })

  for (let i = 0; i < tables.length; i = i + 1) {
    if (status() === 'canceling') return false
    const table = tables[i]
    await startProcess(table)
    const testData = itemGroupTests.find(t => t.title === table) as ItemGroupTest
    const filtered: PathfinderItem[] = [...items].filter(testData.test)
    await buildTable(logisticsFolder, `LogisticsBoy - ${table}`, filtered, testData.weightAdjustments)
    await stopProcess(table)
  }
  return status() !== 'canceling'
}
export { createRollTables }
