declare const ui: FoundryUI
declare const game: Game

declare namespace RTLB {
  type ValidSystems = 'pf2e' | 'dnd5e'
  type ModuleStatus = 'initializing' | 'ready' | 'running' | 'canceling' | 'aborted' | 'complete'
  interface Sources {
    uniqueSources: string[]
    defaultSources: string[]
    activeSources: () => Promise<string[]>
  }
  interface ThisModule {
    readonly module: RTLB.FoundryModule
    readonly system: ValidSystems
    readonly sources: Sources
    setSources: (sources: Sources) => void
    readonly tables: Tables
    setTables: (tables: Tables) => void
    readonly status: ModuleStatus
    setStatus: (newStatus: RTLB.ModuleStatus, ...args: any[]) => Promise<void>
    readonly interface: Application
    render: (force?: boolean, options?: RenderOptions) => Promise<void>
  }
  interface Tables {
    definitions: Record<string, ItemTestGroup>
    build: (group: string, table: string) => Promise<void>
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
    main: ThisModule
  }
}

/*
type ValidSystems = 'pf2e' | 'dnd5e'
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
  interface: Interface
}

type MainInterfaceStatus = 'initialized' | 'running' | 'canceling' | 'aborted' | 'complete'

interface MainInterfaceProcess {
  name: string
  icon: string
  iconAnimation?: string
}

interface MainInterfaceButtonState {
  status: MainInterfaceStatus
  title: string
  action: string
  disabled: boolean
  icon: string
  iconAnimation?: string
}

interface MainInterfaceData {
  moduleInfo: Record<string, any>
  status: MainInterfaceStatus
  availableGroups: ItemGroupTest[]
  processes: MainInterfaceProcess[] | undefined
  button: MainInterfaceButtonProps
}
type MainInterfaceProcessCallback = (message: string) => Promise<void>
*/
