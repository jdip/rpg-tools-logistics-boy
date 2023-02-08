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
    misc(item) ||
    bomb(item) ||
    elixir(item) ||
    mutagen(item) ||
    oil(item) ||
    poison(item) ||
    potion(item)
  )
}
export const Alchemist: RTLB.TableGroupDefinitions = {
  bomb: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Bombs',
    description: 'RTLB.Bombs',
    adjustments: {},
    test: bomb
  },
  elixir: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Elixirs',
    description: 'RTLB.Elixirs',
    adjustments: {},
    test: elixir
  },
  mutagen: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Mutagens',
    description: 'RTLB.Mutagens',
    adjustments: {},
    test: mutagen
  },
  oil: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Oils',
    description: 'RTLB.Oils',
    adjustments: {},
    test: oil
  },
  poison: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Poisons',
    description: 'RTLB.Poisons',
    adjustments: {},
    test: poison
  },
  potion: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Potions',
    description: 'RTLB.Potions',
    adjustments: { 'Healing Potion (Minor)': 2 },
    test: potion
  },
  misc: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.Misc',
    description: 'RTLB.Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    group: 'RTLB.Alchemist',
    title: 'RTLB.All',
    description: 'RTLB.BombsElixirsMutagensOilsPoisonsPotions',
    adjustments: {},
    test: all
  }
}
