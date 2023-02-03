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
    title: 'Bombs',
    description: 'Bombs',
    adjustments: {},
    test: all
  },
  elixir: {
    title: 'Elixirs',
    description: 'Elixirs',
    adjustments: {},
    test: all
  },
  mutagen: {
    title: 'Mutagens',
    description: 'Mutagens',
    adjustments: {},
    test: all
  },
  oil: {
    title: 'Oils',
    description: 'Oils',
    adjustments: {},
    test: all
  },
  poison: {
    title: 'Poisons',
    description: 'Poisons',
    adjustments: {},
    test: all
  },
  potion: {
    title: 'Potions',
    description: 'Potions',
    adjustments: {},
    test: all
  },
  misc: {
    title: 'Misc',
    description: 'Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    title: 'Alchemist Shop',
    description: 'Bombs, Elixirs, Mutagens, Oils, Poisons, & Potions',
    adjustments: {},
    test: all
  }
}
