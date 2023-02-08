import { hasTraits } from './helpers'
import { staff } from './arcanist'

const axe = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'axe'
  )
}

const club = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'club' &&
    !staff(item)
  )
}

const flail = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'flail'
  )
}

const hammer = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'hammer'
  )
}

const knife = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'knife'
  )
}

const pick = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'pick'
  )
}

const polearm = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'polearm'
  )
}

const spear = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'spear'
  )
}

const sword = (item: PathfinderItem): boolean => {
  return (
    item.type === 'weapon' &&
    item.system.group === 'sword'
  )
}

const misc = (item: PathfinderItem): boolean => {
  return (
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
        !item.system.traits.value.includes('staff') &&
        !item.system.traits.value.includes('consumable')
      ) &&
      item.name?.match(/[Gg]auntlet/g) === null &&
      item.name !== 'Fist' &&
      item.name !== 'Shield Bash'
    ) || (
      item.name === 'Sheath'
    )
  ) && (
    !axe(item) &&
    !club(item) &&
    !flail(item) &&
    !hammer(item) &&
    !knife(item) &&
    !pick(item) &&
    !polearm(item) &&
    !spear(item) &&
    !sword(item)
  )
}

const all = (item: PathfinderItem): boolean => {
  return (
    axe(item) ||
    club(item) ||
    flail(item) ||
    hammer(item) ||
    knife(item) ||
    pick(item) ||
    polearm(item) ||
    spear(item) ||
    sword(item) ||
    misc(item)
  )
}

export const Weaponsmith: RTLB.TableGroupDefinitions = {
  axe: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Axe',
    description: 'RTLB.Axe',
    adjustments: {},
    test: axe
  },
  club: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Club',
    description: 'RTLB.Club',
    adjustments: {},
    test: club
  },
  flail: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Flail',
    description: 'RTLB.Flail',
    adjustments: {},
    test: flail
  },
  hammer: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Hammer',
    description: 'RTLB.Hammer',
    adjustments: {},
    test: hammer
  },
  knife: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Knife',
    description: 'RTLB.Knife',
    adjustments: {},
    test: knife
  },
  pick: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Pick',
    description: 'RTLB.Pick',
    adjustments: {},
    test: pick
  },
  polearm: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Polearm',
    description: 'RTLB.Polearm',
    adjustments: {},
    test: polearm
  },
  spear: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Spear',
    description: 'RTLB.Spear',
    adjustments: {},
    test: spear
  },
  sword: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Sword',
    description: 'RTLB.Sword',
    adjustments: {},
    test: sword
  },
  all: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.All',
    description: 'RTLB.MeleeWeapons',
    adjustments: {},
    test: all
  },
  misc: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Misc',
    description: 'RTLB.Misceallenous',
    adjustments: {},
    test: misc
  }
}
