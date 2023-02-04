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

export const cloneAndFreezeArray = <T>(original: T[]): T[] => {
  const clone = [...original]
  Object.freeze(clone)
  return clone
}
