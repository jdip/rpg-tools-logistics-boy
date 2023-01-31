import moduleInfo from '../module.json'
const defaultPacks = [
  'Pathfinder Core Rulebook',
  'Pathfinder Gamemastery Guide',
  'Pathfinder Bestiary',
  'Pathfinder Bestiary 2',
  'Pathfinder Bestiary 3',
  'Pathfinder Secrets of Magic',
  'Pathfinder Advanced Player\'s Guide',
  'Pathfinder Dark Archive',
  'Pathfinder Book of the Dead'
]

const getEquipmentPack = (): CompendiumCollection => {
  console.log('PACKS', game?.packs)
  const equipmentPack = game?.packs?.get('pf2e.equipment-srd')
  if (equipmentPack === undefined) {
    ui?.notifications?.error(
      `${moduleInfo.title}: ${game.i18n.localize('RTLB.EquipmentCompendiumNotInitialized')}`
    )
    throw new Error(`${moduleInfo.title}: ${game.i18n.localize('RTLB.EquipmentCompendiumNotInitialized')}`)
  }
  return equipmentPack
}

let itemSources: string[]
const getUniqueItemSources = async (): Promise<string[]> => {
  const equipmentPack = getEquipmentPack()
  const documents = await equipmentPack.getDocuments()
  const uniqueSources = new Set(documents.map(i => {
    const item = (i as unknown as PathfinderItem)
    return item.system?.source?.value
  }))

  itemSources = ([...uniqueSources].filter(s => s !== undefined) as string[]).sort()
  return itemSources
}

export { getUniqueItemSources, itemSources, defaultPacks }
