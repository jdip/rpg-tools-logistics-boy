import meta from './module.json'
import config from './config.json'
import { reportError, cloneAndFreezeArray } from './helpers'

const getPF2eEquipmentPacks = (): CompendiumCollection[] => {
  const equipmentPacks: CompendiumCollection[] = []
  const pack = game?.packs?.get(config.pf2e.packs[0])
  if (pack === undefined) throw reportError('RTLB.EquipmentCompendiumNotInitialized')
  equipmentPacks.push(pack)
  return equipmentPacks
}

const getPF2eUniqueItemSources = async (): Promise<string[]> => {
  const uniqueSources = new Set<string>()
  const packs = getPF2eEquipmentPacks()
  await Promise.all(packs.map(async (pack) => {
    const documents = (await pack.getDocuments()) as unknown as PathfinderItem[]
    documents.forEach(item => {
      if (typeof item.system.source?.value === 'string') uniqueSources.add(item.system.source.value)
    })
  }))
  return ([...uniqueSources].filter(s => s !== undefined)).sort()
}

export const createSources = async (module: RTLB.ThisModule): Promise<Sources> => {
  switch (module.system) {
    case 'pf2e': {
      const uniqueSources = await getPF2eUniqueItemSources()
      const defaultSources = config.pf2e.DefaultSources
      return new Sources(uniqueSources, defaultSources)
    }
    /* istanbul ignore next */
    default:
      throw reportError('RTLB.InvalidGameSystem')
  }
}

class Sources implements RTLB.Sources {
  constructor (uniqueSources: string[], defaultSources: string[]) {
    this._uniqueSources = cloneAndFreezeArray(uniqueSources)
    this._defaultSources = cloneAndFreezeArray(defaultSources)
    this._registerSettings()
  }

  private readonly _uniqueSources: string[]
  get uniqueSources (): string[] {
    return this._uniqueSources
  }

  private readonly _defaultSources: string[]
  get defaultSources (): string[] {
    return this._defaultSources
  }

  private _registerSettings (): void {
    this.uniqueSources.forEach(source => {
      game.settings.register(meta.name, source, {
        name: source,
        scope: 'world',
        config: false,
        type: Boolean,
        default: this.defaultSources.includes(source)
      })
    })
  }

  async activeSources (): Promise<string[]> {
    const settings = await Promise.all(this.uniqueSources.map(async (source) => {
      return { name: source, value: game.settings.get(meta.name, source) }
    }))
    const result = settings.filter(source => source.value).map<string>(source => source.name)
    Object.freeze(result)
    return result
  }
}
