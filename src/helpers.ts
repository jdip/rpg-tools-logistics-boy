import meta from './module.json'

export const isValidSystem = (systemId: unknown): systemId is RTLB.ValidSystems => {
  return systemId === 'pf2e' || systemId === 'dnd5e'
}

export const isFoundryModule = (moduleDocument: unknown): moduleDocument is RTLB.FoundryModule => {
  return typeof moduleDocument === 'object' &&
    moduleDocument !== null &&
    Object.hasOwn(moduleDocument, 'id') &&
    (moduleDocument as { id: any }).id === meta.name
}

export const reportError = (error: string | Error, localize: boolean = true): Error => {
  const message = typeof error === 'string' ? error : error.message
  const errorMessage = (localize && message.startsWith('RTLB')) ? game.i18n.localize(message) : message
  ui.notifications?.error(`${meta.title}: ${game.i18n.localize('RTLB.UnexpectedError')}, ${game.i18n.localize('RTLB.ReportBugsAt')} ${meta.bugs}`)
  return error instanceof Error
    ? error
    : new Error(`${meta.title}: ${errorMessage}`)
}

export const deepFreeze = <T extends object>(object: T, paths?: string[], currentPath?: string): T => {
  paths = paths ?? []
  currentPath = currentPath ?? ''
  const propNames = Reflect.ownKeys(object)
  for (const name of (propNames as Array<keyof typeof object>)) {
    const value = object[name]
    if ((value !== undefined && value !== null && typeof value === 'object')) {
      deepFreeze(value, paths, `${currentPath}.${String(name)}`)
    }
  }
  return Object.freeze(object)
}

export const isKeyOf = <T extends object>(obj: T, key: string): key is keyof T & string => {
  return Object.hasOwn(obj, key)
}

export const isPathfinderItem = (obj: object): obj is PathfinderItem => {
  return obj?.constructor?.name !== undefined &&
    [
      'EquipmentPF2e',
      'TreasurePF2e',
      'ConsumablePF2e',
      'WeaponPF2e',
      'ArmorPF2e',
      'ContainerPF2e',
      'KitPF2e'
    ].includes(obj.constructor.name)
}

export const isPathfinderItemArray = (obj: object): obj is PathfinderItem[] => {
  return Array.isArray(obj) && isPathfinderItem(obj[0])
}
