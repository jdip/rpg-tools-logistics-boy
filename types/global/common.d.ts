declare const ui: FoundryUI
declare const game: Game

declare namespace RTLB {
  type ValidSystems = 'pf2e' | 'dnd5e'
  type MainStatus = 'initializing' | 'initialized' | 'idle' | 'running' | 'canceling' | 'aborted' | 'complete'
  interface ProgressUpdate {
    group: string
    table: string
    status: 'pending' | 'running' | 'canceled' | 'done'
  }
  type ProgressItem = ProgressUpdate & {
    definition: RTLB.TableGroupDefinition
  }

  interface Main {
    readonly module: RTLB.FoundryModule
    readonly system: RTLB.ValidSystems
    readonly sources: RTLB.Sources
    readonly tables: RTLB.Tables
    readonly status: RTLB. MainStatus
    setStatus: (newStatus: RTLB.MainStatus) => Promise<void>
    isReady: boolean
    readonly interface: Application
    progress: RTLB.ProgressItem[]
    setProgress: (progress: RTLB.ProgressItem[]) => Promise<void>
    updateProgress: (progressItem: RTLB.ProgressUpdate) => Promise<void>
  }
  interface Sources {
    init: () => Promise<void>
    uniqueSources: string[]
    defaultSources: string[]
    activeSources: () => Promise<string[]>
    getItems: () => Promise<unknown[]>
  }
  interface Tables {
    definitions: Record<string, RTLB.ItemTestGroup>
    availableTables: Record<string, RTLB.TableGroupDefinitions>
    getFolder: () => Promise<Folder>
    cancel: () => void
    updateAvailableTables: () => Promise<void>
    build: (table: string, group: string, items: unknown[]) => Promise<RollTable, RTLB.TableGroupDefinition>
    buildAll: (tables: Array<[string, string]>) => Promise<void>
  }
  type TableGroupSystem = Record<string, RTLB.TableGroupDefinitions>
  type TableGroupDefinitions = Record<string, RTLB.TableGroupDefinition>
  interface TableGroupDefinition {
    group: string
    title: string
    description: string
    adjustments: Record<string, number>
    test: (item: RTLB.PathfinderItem) => boolean
  }
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
    main: RTLB.Main
  }
}
