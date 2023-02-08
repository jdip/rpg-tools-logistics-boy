import { hasTraits } from './helpers'

const clockwork = (item: PathfinderItem): boolean => {
  return (
    hasTraits(item.system.traits) &&
    item.system.traits.value.includes('clockwork')
  )
}

const gadget = (item: PathfinderItem): boolean => {
  return (
    hasTraits(item.system.traits) &&
    item.system.traits.value.includes('gadget')
  )
}

const all = (item: PathfinderItem): boolean => {
  return (
    clockwork(item) ||
    gadget(item)
  )
}

export const Tinkerer: RTLB.TableGroupDefinitions = {
  clockwork: {
    group: 'RTLB.Tinkerer',
    title: 'RTLB.Clockwork',
    description: 'RTLB.Clockwork',
    adjustments: {},
    test: clockwork
  },
  gadget: {
    group: 'RTLB.Tinkerer',
    title: 'RTLB.Gadget',
    description: 'RTLB.Gadget',
    adjustments: {},
    test: gadget
  },
  all: {
    group: 'RTLB.Tinkerer',
    title: 'RTLB.All',
    description: 'RTLB.ClockworkGadgets',
    adjustments: {},
    test: all
  }
}
