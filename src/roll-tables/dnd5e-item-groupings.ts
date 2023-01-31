const hasTraits = (traits: unknown): traits is { value: string[] } => (
  typeof traits === 'object' &&
  traits !== null &&
  Object.hasOwn(traits, 'value') &&
  Array.isArray((traits as { value: unknown }).value)
)

const alchemist = (item: PathfinderItem): boolean => (
  (
    item.type === 'consumable' &&
    (
      (
        item.system.consumableType?.value === 'potion' ||
        item.system.consumableType?.value === 'oil' ||
        item.system.consumableType?.value === 'mutagen' ||
        item.system.consumableType?.value === 'elixir' ||
        item.system.consumableType?.value === 'poison'
      ) || (
        hasTraits(item.system.traits) &&
        item.system.traits.value.includes('alchemical')
      )
    )
  ) || (
    item.system.group === 'bomb' ||
    item.name?.startsWith("Alchemist's")
  )
)
const arcanist = (item: PathfinderItem): boolean => (
  (
    hasTraits(item.system.traits) &&
    item.system.traits.value.includes('staff')
  ) || (
    item.name !== null &&
    (
      item.name.startsWith('Scroll ') ||
      item.name.startsWith('Spellbook') ||
      item.name.startsWith('Material Component Pouch') ||
      item.name.match(/Scroll Case/) !== null ||
      item.name.match(/Wand /) !== null ||
      item.name.match(/Robe/) !== null
    )
  )
)
const armorHard = (item: PathfinderItem): boolean => (
  (
    item.type === 'armor' &&
    item.system.category !== 'shield' &&
    item.system.group !== 'leather' &&
    item.system.category !== 'unarmored' &&
    item.name !== 'Padded Armor'
  ) || (
    item.name?.includes('Gauntlet')
  )
)
const armorSoft = (item: PathfinderItem): boolean => (
  (
    item.type === 'armor' &&
    item.system.category !== 'shield' &&
    item.system.group === 'leather' &&
    item.system.category !== 'unarmored'
  ) || (
    item.name === 'Padded Armor'
  )
)
const clockwork = (item: PathfinderItem): boolean => (
  hasTraits(item.system.traits) &&
  (
    item.system.traits.value.includes('clockwork') ||
    item.system.traits.value.includes('gadget')
  )
)
const clothingExclusive = (item: PathfinderItem): boolean => (
  item.name === 'Clothing (Fine)' ||
  item.name === 'Clothing (High-Fashion Fine)'
)
const clothing = (item: PathfinderItem): boolean => clothingExclusive(item) || item.name.startsWith('Clothing')
const generalStore = (item: PathfinderItem): boolean => (
  (
    item.type === 'equipment' ||
    item.type === 'backpack' ||
    (
      item.type === 'consumable' && (
        item.system.consumableType?.value !== 'ammunition' &&
        item.system.consumableType?.value !== 'potion' &&
        item.system.consumableType?.value !== 'mutagen' &&
        item.system.consumableType?.value !== 'elixir' &&
        item.system.consumableType?.value !== 'poison'
      )
    )
  ) &&
  item.system.traits?.rarity === 'common' &&
  !item.name.startsWith('Alchemist\'s') &&
  !(
    hasTraits(item.system.traits) &&
    (
      item.system.traits.value.includes('clockwork') ||
      item.system.traits.value.includes('snare') ||
      item.system.traits.value.includes('trap') ||
      item.system.traits.value.includes('alchemical') ||
      item.system.traits.value.includes('elixir') ||
      item.system.traits.value.includes('mutagen') ||
      item.system.traits.value.includes('alchemical') ||
      item.system.traits.value.includes('magical') ||
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
      item.system.traits.value.includes('apex') ||
      item.system.traits.value.includes('invested') ||
      item.system.traits.value.includes('precious')
    )
  ) &&
  !shadyDealerExclusive(item) &&
  !outfitterExclusive(item) &&
  !weaponsAmmunition(item) &&
  !weaponsMelee(item) &&
  !weaponsRanged(item) &&
  !clothingExclusive(item) &&
  !arcanist(item)
)
const runes = (item: PathfinderItem): boolean => (
  (
    item.type === 'equipment' &&
    item.system.usage?.value !== undefined &&
    item.system.usage.value.startsWith('etched-onto')
  )
)
const oddities = (item: PathfinderItem): boolean => (
  (
    (
      item.type === 'equipment' ||
      item.type === 'backpack'
    ) &&
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
    )
  ) &&
  !runes(item)
)
const talismansTokensTrinkets = (item: PathfinderItem): boolean => (
  !alchemist(item) &&
  !arcanist(item) &&
  !weaponsAmmunition(item) &&
  item.type === 'consumable' &&
  hasTraits(item.system.traits) &&
  (
    item.system.consumableType?.value === 'talisman' ||
    item.system.traits.value.includes('magical')
  )
)
const outfitterExclusive = (item: PathfinderItem): boolean => (
  (
    item.type === 'equipment' &&
    (
      item.name.startsWith('Manacles') ||
      item.name.startsWith('Grappling Hook') ||
      item.name.startsWith('Caltrops') ||
      item.name.startsWith('Manacles') ||
      item.name.startsWith('Climbing Kit') ||
      item.name.startsWith('Tent') ||
      item.name.startsWith('Ten-Foot Pole') ||
      item.name.startsWith('Survey Map') ||
      item.name.startsWith('Snare Kit')
    )
  ) || (
    hasTraits(item.system.traits) &&
    (
      item.system.traits.value.includes('snare') ||
      item.system.traits.value.includes('trap')
    )
  )
)
const outfitterAdditions = (item: PathfinderItem): boolean => (
  (
    item.system.traits?.rarity === 'common' &&
    (
      item.name.startsWith('Oil (1 pint)') ||
      item.name.startsWith('Bandolier') ||
      item.name.startsWith('Backpack') ||
      item.name.startsWith('Sack') ||
      item.name.startsWith('Belt Pouch') ||
      item.name.startsWith('Satchel') ||
      item.name.startsWith('Saddlebags') ||
      item.name.startsWith('Rations') ||
      item.name.includes('Ladder') ||
      item.name.startsWith('Fishing Tackle') ||
      item.name.startsWith('Soap') ||
      item.name.startsWith('Torch') ||
      item.name.startsWith('Tack') ||
      item.name.startsWith('Hammer') ||
      item.name.startsWith('Lantern') ||
      item.name.startsWith('Candle') ||
      item.name.startsWith('Signal Whistle') ||
      item.name.startsWith('Flint and Steel') ||
      item.name.startsWith('Spyglass') ||
      item.name.startsWith('Waterskin') ||
      item.name.startsWith('Cookware') ||
      item.name.startsWith('Tool') ||
      item.name.startsWith('Repair Kit') ||
      item.name.startsWith('Bedroll') ||
      item.name.startsWith('Rope') ||
      item.name.startsWith('Piton') ||
      item.name.startsWith('Healer\'s Tools') ||
      item.name.startsWith('Mug') ||
      item.name.startsWith('Compass') ||
      item.name.startsWith('Chalk') ||
      item.name.startsWith('Adventurer\'s Pack')
    )
  ) || (
    item.system.traits?.rarity === 'common' &&
    (
      item.system.stackGroup === 'arrows' ||
      item.system.stackGroup === 'bolts' ||
      item.system.stackGroup === 'slingBullets' ||
      item.system.stackGroup === 'blowgunDarts' ||
      item.system.group === 'dart' ||
      item.system.group === 'bow' ||
      item.system.group === 'sling'
    ) &&
    !(
      hasTraits(item.system.traits) &&
      (
        item.system.traits.value.includes('alchemical') ||
        item.system.traits.value.includes('elixir') ||
        item.system.traits.value.includes('mutagen') ||
        item.system.traits.value.includes('alchemical') ||
        item.system.traits.value.includes('magical') ||
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
        item.system.traits.value.includes('apex') ||
        item.system.traits.value.includes('invested') ||
        item.system.traits.value.includes('precious')
      )
    )
  )
)
const outfitter = (item: PathfinderItem): boolean => (
  outfitterExclusive(item) ||
  outfitterAdditions(item)
)
const shadyDealerExclusive = (item: PathfinderItem): boolean => (
  (
    item.type === 'equipment' &&
    (
      item.name.startsWith('Disguise Kit') ||
      item.name.startsWith('Thieves\' Tools')
    )
  ) || (
    item.name.startsWith('Sneaky Key')
  )
)
const shadyDealerAdditions = (item: PathfinderItem): boolean => (
  (
    (
      item.type === 'equipment' &&
      (
        item.name.startsWith('Grappling Hook') ||
        item.name.startsWith('Caltrops') ||
        item.name.startsWith('Manacles') ||
        item.name.startsWith('Vial') ||
        item.name.startsWith('Chalk') ||
        item.name.startsWith('Oil (1 pint)') ||
        item.name.startsWith('Crowbar') ||
        item.name.startsWith('Manacles') ||
        item.name.startsWith('Lock') ||
        item.name.includes('Ladder')
      )
    ) || (
      item.type === 'consumable' && (
        item.system.consumableType?.value === 'poison'
      )
    ) || (
      hasTraits(item.system.traits) &&
      (
        item.system.traits.value.includes('snare') ||
        item.system.traits.value.includes('trap')
      )
    )
  )
)
const shadyDealer = (item: PathfinderItem): boolean => (
  shadyDealerExclusive(item) ||
  shadyDealerAdditions(item)
)
const shields = (item: PathfinderItem): boolean => (
  item.type === 'armor' &&
  item.system.category === 'shield'
) || (
  item.system.group === 'shield' &&
  item.name !== 'Shield Bash'
)
const treasure = (item: PathfinderItem): boolean => (
  (
    item.type === 'treasure' ||
    (
      hasTraits(item.system.traits) &&
      item.system.traits.value.includes('precious')
    )
  ) &&
  item.system.stackGroup !== 'coins'
)
const weaponsMelee = (item: PathfinderItem): boolean => (
  (
    item.type === 'weapon' &&
    item.system.group !== 'bomb' &&
    item.system.group !== 'dart' &&
    item.system.group !== 'bow' &&
    item.system.group !== 'sling' &&
    item.system.group !== 'firearm' &&
    item.system.group !== 'shield' &&
    (
      hasTraits(item.system.traits) &&
      !item.system.traits.value.includes('staff')
    ) &&
    item.name?.match(/[Gg]auntlet/g) === null &&
    item.name !== 'Fist' &&
    item.name !== 'Shield Bash'
  ) || (
    item.name === 'Sheath'
  )
)
const weaponsRanged = (item: PathfinderItem): boolean => (
  (
    item.type === 'weapon' &&
    item.system.group !== 'bomb' &&
    item.system.group !== 'shield' &&
    (
      item.system.group === 'dart' ||
      item.system.group === 'bow' ||
      item.system.group === 'sling' ||
      item.system.group === 'firearm'
    ) &&
    (
      hasTraits(item.system.traits) &&
      !item.system.traits.value.includes('staff')
    ) &&
    item.name?.match(/[Gg]auntlet/g) === null &&
    item.name !== 'Fist' &&
    item.name !== 'Shield Bash'
  )
)
const weaponsAmmunition = (item: PathfinderItem): boolean => (
  item.system.stackGroup === 'arrows' ||
  item.system.stackGroup === 'bolts' ||
  item.system.stackGroup === 'slingBullets' ||
  item.system.stackGroup === 'blowgunDarts' ||
  (
    (
      item.system.consumableType?.value === 'ammunition' ||
      item.system.consumableType?.value === 'ammo'
    ) &&
    !item.name.startsWith('Feather Token')
  )
)

const dnd5eItemGroupTests: ItemGroupTest[] = [
  {
    title: 'Alchemist',
    details: 'bombs, elixirs, mutagens, oils, potions, poisons',
    test: alchemist,
    weightAdjustments: {
      'Healing Potion (Minor)': 3,
      'Healing Potion (Lesser)': 2
    }
  },
  {
    title: 'Arcanist',
    details: 'robes, staves, scrolls, wands',
    test: arcanist,
    weightAdjustments: {}
  },
  {
    title: 'Armor: Hard',
    details: 'mundane & magical metal armor',
    test: armorHard,
    weightAdjustments: {}
  },
  {
    title: 'Armor: Soft',
    details: 'mundane & magical leather/cloth armor',
    test: armorSoft,
    weightAdjustments: {}
  },
  {
    title: 'Clockworks',
    details: 'mechanical inventions',
    test: clockwork,
    weightAdjustments: {}
  },
  {
    title: 'Clothing',
    details: 'mundane clothes',
    test: clothing,
    weightAdjustments: {}
  },
  {
    title: 'General Store',
    details: 'everyday in-town items',
    test: generalStore,
    weightAdjustments: {}
  },
  {
    title: 'Oddities',
    details: 'magic items not found elsewhere',
    test: oddities,
    weightAdjustments: {}
  },
  {
    title: 'Talismans, Tokens & Trinkets',
    details: 'consumable magic items',
    test: talismansTokensTrinkets,
    weightAdjustments: {}
  },
  {
    title: 'Runes',
    details: 'magical enhancements',
    test: runes,
    weightAdjustments: {}
  },
  {
    title: 'Outfitter',
    details: 'everyday exploration & survival gear',
    test: outfitter,
    weightAdjustments: {}
  },
  {
    title: 'Black Market',
    details: 'traps, poisons, disguises, thieving implements',
    test: shadyDealer,
    weightAdjustments: {}
  },
  {
    title: 'Shields',
    details: 'shields & accessories',
    test: shields,
    weightAdjustments: {}
  },
  {
    title: 'Precious Goods',
    details: 'Rare metals & gems',
    test: treasure,
    weightAdjustments: {}
  },
  {
    title: 'Weapons: Melee',
    details: 'mundane & magical',
    test: weaponsMelee,
    weightAdjustments: {}
  },
  {
    title: 'Weapons: Ranged',
    details: 'mundane & magical',
    test: weaponsRanged,
    weightAdjustments: {}
  },
  {
    title: 'Weapons: Ammunition',
    details: 'mundane & magical',
    test: weaponsAmmunition,
    weightAdjustments: {
      Arrows: 2,
      Bolts: 2,
      'Sling Bullets': 2
    }
  }
]
const coreTests = [...dnd5eItemGroupTests]

dnd5eItemGroupTests.sort((a, b) => a.title.localeCompare(b.title))

dnd5eItemGroupTests.push({
  title: 'Other',
  details: 'catch-all for uncategorized items',
  test: (item: PathfinderItem) => {
    for (let i = 0; i < coreTests.length; i = i + 1) {
      if (coreTests[i].test(item)) {
        return false
      }
    }
    return true
  },
  weightAdjustments: {}
})

export { dnd5eItemGroupTests }
