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

const melee = (item: PathfinderItem): boolean => {
  return (
    axe(item) ||
    club(item) ||
    flail(item) ||
    hammer(item) ||
    knife(item) ||
    pick(item) ||
    polearm(item) ||
    spear(item) ||
    sword(item)
  )
}

const meleeMisc = (item: PathfinderItem): boolean => {
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
  ) && !melee(item)
}

const bows = (item: PathfinderItem): boolean => {
  return (
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
}

const ammunition = (item: PathfinderItem): boolean => {
  return (
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
}

const all = (item: PathfinderItem): boolean => {
  return (
    melee(item) ||
    ranged(item) ||
    ammunition(item)
  )
}

export const Weaponsmith: RTLB.TableGroupDefinitions = {
  bows: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Bows',
    description: 'RTLB.Bows',
    adjustments: {},
    test: bows
  },
  ammunition: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.Ammunition',
    description: 'RTLB.Ammunition',
    adjustments: {},
    test: ammunition
  },
  all: {
    group: 'RTLB.Weaponsmith',
    title: 'RTLB.All',
    description: 'RTLB.MeleeWeapons',
    adjustments: {},
    test: all
  }
}
