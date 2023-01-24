
const hasTraits = (traits: unknown): traits is { value: string[] } => (
  typeof traits === 'object' &&
  traits !== null &&
  Object.hasOwn(traits, 'value') &&
  Array.isArray((traits as { value: unknown }).value)
)

const tableTests = {
  Shields: (item: PathfinderItem) => (
    item.type === 'armor' &&
    item.system.category === 'shield'
  ) || (
    item.system.group === 'shield' &&
    item.name !== 'Shield Bash'
  ),
  'Armor: Hard': (item: PathfinderItem) => (
    item.type === 'armor' &&
    item.system.category !== 'shield' &&
    item.system.group !== 'leather' &&
    item.system.category !== 'unarmored' &&
    item.name !== 'Padded Armor'
  ) || (
    item.name?.match(/[Gg]auntlet/g)
  ),
  'Armor: Soft': (item: PathfinderItem) => (
    item.type === 'armor' &&
    item.system.category !== 'shield' &&
    item.system.group === 'leather' &&
    item.system.category !== 'unarmored'
  ) || (
    item.name === 'Padded Armor'
  ),
  Clothing: (item: PathfinderItem) =>
    (
      item.type === 'equipment' ||
      item.type === 'backpack'
    ) && (
      item.system.rarity === 'common' &&
      item.name?.startsWith("Alchemist's") === false &&
      hasTraits(item.system.traits) &&
      !item.system.traits.value.includes('magical') &&
      !item.system.traits.value.includes('abjuration') &&
      !item.system.traits.value.includes('conjuration') &&
      !item.system.traits.value.includes('divination') &&
      !item.system.traits.value.includes('enchantment') &&
      !item.system.traits.value.includes('evocation') &&
      !item.system.traits.value.includes('illusion') &&
      !item.system.traits.value.includes('necromancy') &&
      !item.system.traits.value.includes('transmutation') &&
      !item.system.traits.value.includes('divine') &&
      !item.system.traits.value.includes('primal') &&
      !item.system.traits.value.includes('apex') &&
      !item.system.traits.value.includes('invested') &&
      !item.system.traits.value.includes('precious')
    ),
  Alchemist: (item: PathfinderItem) =>
    (
      item.type === 'consumable' &&
      (
        item.system.consumableType?.value === 'potion' ||
        item.system.consumableType?.value === 'oil' ||
        item.system.consumableType?.value === 'potion' ||
        item.system.consumableType?.value === 'mutagen' ||
        item.system.consumableType?.value === 'elixir' ||
        item.system.consumableType?.value === 'poison'
      )
    ) || (
      item.system.group === 'bomb' ||
      item.name?.startsWith("Alchemist's")
    ),
  'Weapons: Melee': (item: PathfinderItem) => (
    item.type === 'weapon' &&
    item.system.group !== 'bomb' &&
    item.system.group !== 'dart' &&
    item.system.group !== 'bow' &&
    item.system.group !== 'sling' &&
    item.system.group !== 'shield' &&
    (
      hasTraits(item.system.traits) &&
      !item.system.traits.value.includes('staff')
    ) &&
    item.name?.match(/[Gg]auntlet/g) === null &&
    item.name !== 'Fist' &&
    item.name !== 'Shield Bash'
  ),
  'Weapons: Ranged': (item: PathfinderItem) =>
    (
      item.type === 'weapon' &&
      item.system.group !== 'bomb' &&
      item.system.group !== 'shield' &&
      (
        item.system.group === 'dart' ||
        item.system.group === 'bow' ||
        item.system.group === 'sling'
      ) &&
      (
        hasTraits(item.system.traits) &&
        !item.system.traits.value.includes('staff')
      ) &&
      item.name?.match(/[Gg]auntlet/g) === null &&
      item.name !== 'Fist' &&
      item.name !== 'Shield Bash'
    ) ||
    item.system.stackGroup === 'arrows' ||
    item.system.stackGroup === 'bolts' ||
    item.system.stackGroup === 'slingBullets' ||
    item.system.stackGroup === 'blowgunDarts',
  Oddities: (item: PathfinderItem) =>
    item.type === 'equipment' &&
    hasTraits(item.system.traits) &&
    (
      item.system.traits.value.includes('magical') ||
      item.system.traits.value.includes('invested') ||
      item.system.traits.value.includes('abjuration') ||
      item.system.traits.value.includes('conjuration') ||
      item.system.traits.value.includes('divination') ||
      item.system.traits.value.includes('enchantment') ||
      item.system.traits.value.includes('evocation') ||
      item.system.traits.value.includes('illusion') ||
      item.system.traits.value.includes('necromancy') ||
      item.system.traits.value.includes('transmutation') ||
      item.system.traits.value.includes('divine') ||
      item.system.traits.value.includes('primal') ||
      item.system.traits.value.includes('apex')
    ),
  Arcana: (item: PathfinderItem) =>
    (
      hasTraits(item.system.traits) &&
      item.system.traits.value.includes('staff')
    ) || (
      item.name !== null &&
      (
        item.name.startsWith('Scroll ') ||
        item.name.match(/Scroll Case/) !== null ||
        item.name.match(/Wand /) !== null ||
        item.name.match(/Robe/) !== null
      )
    ),
  Treasure: (item: PathfinderItem) =>
    (
      item.type === 'treasure' ||
      (
        hasTraits(item.system.traits) &&
        item.system.traits.value.includes('precious')
      )
    ) &&
    item.system.stackGroup !== 'coins'
}

const availableTables = Object.keys(tableTests).sort()
const isGame = (game: Game | unknown): game is Game => {
  return game instanceof Game
}

const isFolders = (folders: Folders | unknown): folders is Folders => {
  return folders instanceof Folders
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
  console.log(logisticsFolder)
  for (let i = 0; i < tables.length; i = i + 1) {
    if (status() === 'canceling') return false
    const table = tables[i]
    startProcess(table)
    await new Promise(resolve => setTimeout(resolve, 2000))
    stopProcess(table)
  }
  return status() !== 'canceling'
}
export { availableTables, createRollTables }
