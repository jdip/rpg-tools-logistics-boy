declare const ui: FoundryUI
declare const game: Game

declare namespace RTLB {
  type ValidSystems = 'pf2e' | 'dnd5e'
  type MainStatus = 'initializing' | 'initialized' | 'idle' | 'running' | 'canceling' | 'aborted' | 'complete'
  interface ProgressItem {
    group: string
    table: string
    status: 'pending' | 'running' | 'canceled' | 'done'
  }
  interface Main {
    readonly module: RTLB.FoundryModule
    readonly system: ValidSystems
    readonly sources: Sources
    readonly tables: Tables
    readonly status: ModuleStatus
    setStatus: (newStatus: RTLB.MainStatus, ...args: any[]) => Promise<void>
    isReady: boolean
    readonly interface: Application
    progress: ProgressItem[]
    setProgress: (progress: ProgressItem[]) => void
    updateProgress: (progressItem: ProgressItem) => Promise<void>
  }
  interface Sources {
    init: () => Promise<void>
    uniqueSources: string[]
    defaultSources: string[]
    activeSources: () => Promise<string[]>
    getItems: () => Promise<unknown[]>
  }
  interface Tables {
    definitions: Record<string, ItemTestGroup>
    shouldCancel: () => void
    build: (table: string, group: string, items: unknown[]) => Promise<void>
    buildAll: (tables: Array<[string, string]>) => Promise<void>
  }
  type ItemTestGroup = Record<string, {
    title: string
    description: string
    adjustments: Record<string, number>
    test: (item: PathfinderItem) => boolean
  }>
  interface FoundryModule {
    id: string
    active: boolean
    esmodules: Set<string>
    scripts: Set<string>
    flags: Record<string, Record<string, unknown>>
    title: string
    compatibility: {
      minimum?: string
      verified?: string
      maximum?: string
    }
    main: Main
  }
}
