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
    title: 'RTLB.Robes',
    description: 'RTLB.Robes',
    adjustments: {},
    test: robe
  },
  scroll: {
    title: 'RTLB.Scrolls',
    description: 'RTLB.Scrolls',
    adjustments: {},
    test: scroll
  },
  spellbook: {
    title: 'RTLB.Spellbooks',
    description: 'RTLB.Spellbooks',
    adjustments: {},
    test: spellbook
  },
  staff: {
    title: 'RTLB.Staves',
    description: 'RTLB.Staves',
    adjustments: {},
    test: staff
  },
  wand: {
    title: 'RTLB.Wands',
    description: 'RTLB.Wands',
    adjustments: {},
    test: wand
  },
  misc: {
    title: 'RTLB.Misc',
    description: 'RTLB.Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    title: 'RTLB.Arcanist',
    description: 'RTLB.RobesScrollsSpellbooksStavesWands',
    adjustments: {},
    test: all
  }
}
