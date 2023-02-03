import { hasTraits } from './helpers'

const robe = (item: PathfinderItem): boolean => {
  return (
    item.name?.match(/Robe/) !== null
  )
}
const scroll = (item: PathfinderItem): boolean => {
  return item.name?.startsWith('Scroll ') ?? false
}
const spellbook = (item: PathfinderItem): boolean => {
  return item.name?.startsWith('Spellbook') ?? false
}
const staff = (item: PathfinderItem): boolean => {
  return (
    hasTraits(item.system.traits) &&
    item.system.traits.value.includes('staff')
  )
}
const wand = (item: PathfinderItem): boolean => {
  return item.name?.match(/Wand /) !== null
}
const misc = (item: PathfinderItem): boolean => {
  return (
    (item.name?.startsWith('Material Component Pouch') ?? false) ||
    item.name?.match(/Scroll Case/) !== null
  )
}
const all = (item: PathfinderItem): boolean => {
  return (
    robe(item) ||
    scroll(item) ||
    spellbook(item) ||
    staff(item) ||
    wand(item) ||
    misc(item)
  )
}
export const Arcanist: RTLB.ItemTestGroup = {
  robe: {
    title: 'Robes',
    description: 'Robes',
    adjustments: {},
    test: robe
  },
  scroll: {
    title: 'Scrolls',
    description: 'Scrolls',
    adjustments: {},
    test: scroll
  },
  spellbook: {
    title: 'Spellbooks',
    description: 'Spellbooks',
    adjustments: {},
    test: spellbook
  },
  staff: {
    title: 'Staves',
    description: 'Staves',
    adjustments: {},
    test: staff
  },
  wand: {
    title: 'Wands',
    description: 'Wands',
    adjustments: {},
    test: wand
  },
  misc: {
    title: 'Misc',
    description: 'Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    title: 'Full Shop',
    description: 'Robes, Scrolls, Spellbooks, Staves, & Wands',
    adjustments: {},
    test: all
  }
}
