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

export const staff = (item: PathfinderItem): boolean => {
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
    misc(item) ||
    robe(item) ||
    scroll(item) ||
    spellbook(item) ||
    staff(item) ||
    wand(item)
  )
}
export const Arcanist: RTLB.TableGroupDefinitions = {
  robe: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.Robes',
    description: 'RTLB.Robes',
    adjustments: {},
    test: robe
  },
  scroll: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.Scrolls',
    description: 'RTLB.Scrolls',
    adjustments: {},
    test: scroll
  },
  spellbook: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.Spellbooks',
    description: 'RTLB.Spellbooks',
    adjustments: {},
    test: spellbook
  },
  staff: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.Staves',
    description: 'RTLB.Staves',
    adjustments: {},
    test: staff
  },
  wand: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.Wands',
    description: 'RTLB.Wands',
    adjustments: {},
    test: wand
  },
  misc: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.Misc',
    description: 'RTLB.Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    group: 'RTLB.Arcanist',
    title: 'RTLB.All',
    description: 'RTLB.RobesScrollsSpellbooksStavesWands',
    adjustments: {},
    test: all
  }
}
