
const metal = (item: PathfinderItem): boolean => {
  return (
    item.type === 'armor' &&
    item.system.category !== 'shield' &&
    item.system.group !== 'leather' &&
    item.system.category !== 'unarmored' &&
    item.name !== 'Padded Armor'
  )
}

const shield = (item: PathfinderItem): boolean => {
  return (
    item.type === 'armor' &&
    item.system.category === 'shield'
  ) || (
    item.system.group === 'shield' &&
    item.name !== 'Shield Bash'
  )
}

const soft = (item: PathfinderItem): boolean => {
  return (
    item.type === 'armor' &&
    item.system.category !== 'shield' &&
    item.system.group === 'leather' &&
    item.system.category !== 'unarmored'
  ) || (
    item.name === 'Padded Armor'
  )
}

const misc = (item: PathfinderItem): boolean => {
  return (
    item.name?.includes('Gauntlet')
  )
}

const all = (item: PathfinderItem): boolean => {
  return (
    misc(item) ||
    metal(item) ||
    soft(item) ||
    shield(item)
  )
}
export const Armorer: RTLB.TableGroupDefinitions = {
  metal: {
    group: 'RTLB.Armorer',
    title: 'RTLB.Metal',
    description: 'RTLB.Metal',
    adjustments: {},
    test: metal
  },
  shield: {
    group: 'RTLB.Armorer',
    title: 'RTLB.Shield',
    description: 'RTLB.Shield',
    adjustments: {},
    test: shield
  },
  soft: {
    group: 'RTLB.Armorer',
    title: 'RTLB.Soft',
    description: 'RTLB.Soft',
    adjustments: {},
    test: soft
  },
  misc: {
    group: 'RTLB.Armorer',
    title: 'RTLB.Misc',
    description: 'RTLB.Miscellaneous',
    adjustments: {},
    test: misc
  },
  all: {
    group: 'RTLB.Armorer',
    title: 'RTLB.All',
    description: 'RTLB.MetalArmorSoftArmorShields',
    adjustments: {},
    test: all
  }
}
