import meta from './module.json'
import config from './config.json'
import { reportError, deepFreeze } from './helpers'

export const createSources = (mod: RTLB.Main): RTLB.Sources => {
  switch (mod.system) {
    case 'pf2e': {
      return new PF2eSources()
    }
    /* istanbul ignore next */
    default:
      throw reportError('RTLB.InvalidGameSystem')
  }
}

class AbstractSources implements RTLB.Sources {
  constructor () {
    /* istanbul ignore next */
    if (this.constructor === AbstractSources) {
      throw new Error('Can\'t instantiate abstract class!')
    }
  }

  async init (): Promise<void> {
    this._registerSettings()
  }

  protected readonly _uniqueSources: string[] = []
  get uniqueSources (): string[] {
    return this._uniqueSources
  }

  protected readonly _defaultSources: string[] = []
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
    deepFreeze(result)
    return result
  }

  async getItems (): Promise<unknown[]> {
    throw new Error('this abstract method should be overridden')
  }
}

class PF2eSources extends AbstractSources implements RTLB.Sources {
  private _getPF2eEquipmentPacks (): CompendiumCollection[] {
    const equipmentPacks: CompendiumCollection[] = []
    const pack = game?.packs?.get(config.pf2e.packs[0])
    if (pack === undefined) throw reportError('RTLB.EquipmentCompendiumNotInitialized')
    equipmentPacks.push(pack)
    return equipmentPacks
  }

  private async _getPF2eUniqueItemSources (): Promise<string[]> {
    const uniqueSources = new Set<string>()
    const packs = this._getPF2eEquipmentPacks()
    await Promise.all(packs.map(async (pack) => {
      const documents = (await pack.getDocuments()) as unknown as PathfinderItem[]
      documents.forEach(item => {
        if (typeof item.system.source?.value === 'string') uniqueSources.add(item.system.source.value)
      })
    }))
    return ([...uniqueSources].filter(s => s !== undefined)).sort()
  }

  async init (): Promise<void> {
    const uniqueSources = await this._getPF2eUniqueItemSources()
    for (const us of uniqueSources) {
      this._uniqueSources.push(us)
    }
    deepFreeze(this._uniqueSources)
    for (const ds of config.pf2e.DefaultSources) {
      this._defaultSources.push(ds)
    }
    deepFreeze(this._defaultSources)
    await super.init()
  }

  async getItems (): Promise<PathfinderItem[]> {
    const packs = this._getPF2eEquipmentPacks()
    const sources = await this.activeSources()
    const items = new Set<PathfinderItem>()
    for (const pack of packs) {
      const documents = await pack.getDocuments()
      documents.forEach(i => {
        const item = (i as unknown as PathfinderItem)
        if (item.system?.source?.value !== undefined && sources.includes(item.system.source.value)) {
          items.add(item)
        }
      })
    }
    return [...items]
  }
}
