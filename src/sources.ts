import config from './config.json'
import moduleInfo from './module.json'
export class Sources implements RTLB.Sources {
  private static _getPF2eEquipmentPacks (module: RTLB.ThisModule): CompendiumCollection[] {
    const equipmentPacks: CompendiumCollection[] = []
    const pack = game?.packs?.get(config.pf2e.packs[0])
    if (pack === undefined) throw module.error('RTLB.EquipmentCompendiumNotInitialized')
    equipmentPacks.push(pack)
    return equipmentPacks
  }

  private static async _getPF2eUniqueItemSources (module: RTLB.ThisModule): Promise<string[]> {
    const uniqueSources = new Set<string>()
    const packs = Sources._getPF2eEquipmentPacks(module)
    await Promise.all(packs.map(async (pack) => {
      const documents = (await pack.getDocuments()) as unknown as PathfinderItem[]
      documents.forEach(item => {
        if (typeof item.system.source?.value === 'string') uniqueSources.add(item.system.source.value)
      })
    }))
    return ([...uniqueSources].filter(s => s !== undefined)).sort()
  }

  private static _cloneAndFreezeArray <T>(original: T[]): T[] {
    const clone = [...original]
    Object.freeze(clone)
    return clone
  }

  static async create (module: RTLB.ThisModule): Promise<Sources> {
    switch (module.system) {
      case 'pf2e': {
        const uniqueSources = await Sources._getPF2eUniqueItemSources(module)
        const defaultSources = config.pf2e.DefaultSources
        return new Sources(uniqueSources, defaultSources)
      }
      default:
        throw module.error('RTLB.InvalidGameSystem')
    }
  }

  private constructor (uniqueSources: string[], defaultSources: string[]) {
    this._uniqueSources = Sources._cloneAndFreezeArray(uniqueSources)
    this._defaultSources = Sources._cloneAndFreezeArray(defaultSources)
    this._registerSettings()
  }

  private readonly _uniqueSources: string[]
  private readonly _defaultSources: string[]

  get uniqueSources (): string[] {
    return this._uniqueSources
  }

  get defaultSources (): string[] {
    return this._defaultSources
  }

  get activeSources (): string[] {
    const result = this.uniqueSources.filter(source => game.settings.get(moduleInfo.name, source))
    Object.freeze(result)
    return result
  }

  private _registerSettings (): void {
    this.uniqueSources.forEach(source => {
      game.settings.register(moduleInfo.name, source, {
        name: source,
        scope: 'world',
        config: false,
        type: Boolean,
        default: this.defaultSources.includes(source)
      })
    })
  }
}
