import { hasTraits } from './helpers'

const bomb = (item: PathfinderItem): boolean => {
  return item.system.group === 'bomb'
}
const elixir = (item: PathfinderItem): boolean => {
  return (
    item.type === 'consumable' &&
    item.system.consumableType?.value === 'elixir'
  )
}
const mutagen = (item: PathfinderItem): boolean => {
  return (
    item.type === 'consumable' &&
    item.system.consumableType?.value === 'mutagen'
  )
}
const oil = (item: PathfinderItem): boolean => {
  return (
    item.type === 'consumable' &&
    item.system.consumableType?.value === 'oil'
  )
}
const poison = (item: PathfinderItem): boolean => {
  return (
    item.type === 'consumable' &&
    item.system.consumableType?.value === 'poison'
  )
}
const potion = (item: PathfinderItem): boolean => {
  return (
    item.type === 'consumable' &&
    item.system.consumableType?.value === 'potion'
  )
}
const misc = (item: PathfinderItem): boolean => {
  return (
    item.type === 'consumable' &&
    hasTraits(item.system.traits) &&
    item.system.traits.value.includes('alchemical')
  ) || (
    item.name?.startsWith("Alchemist's")
  )
}
const all = (item: PathfinderItem): boolean => {
  return (
    bomb(item) ||
    elixir(item) ||
    mutagen(item) ||
    oil(item) ||
    poison(item) ||
    potion(item) ||
    misc(item)
  )
}
export const Alchemist = {
  bomb: {
    title: 'RTLB.Bombs',
    description: 'RTLB.Bombs',
    adjustments: {},
    test: all
  },
  elixir: {
    title: 'RTLB.Elixirs',
    description: 'RTLB.Elixirs',
    adjustments: {},
    test: all
  },
  mutagen: {
    title: 'RTLB.Mutagens',
    description: 'RTLB.Mutagens',
    adjustments: {},
    test: all
  },
  oil: {
    title: 'RTLB.Oils',
    description: 'RTLB.Oils',
    adjustments: {},
    test: all
  },
  poison: {
    title: 'RTLB.Poisons',
    description: 'RTLB.Poisons',
    adjustments: {},
    test: all
  },
  potion: {
    title: 'RTLB.Potions',
    description: 'RTLB.Potions',
    adjustments: {},
    test: all
  },
  misc: {
    title: 'RTLB.Misc',
    description: 'RTLB.Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    title: 'RTLB.Alchemist',
    description: 'RTLB.BombsElixirsMutagensOilsPoisonsPotions',
    adjustments: {},
    test: all
  }
}
