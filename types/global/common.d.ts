
declare const ui: FoundryUI
declare const game: Game

declare namespace RTLB {
  type ValidSystems = 'pf2e' | 'dnd5e'
  type ModuleStatus = 'initializing' | 'ready' | 'running' | 'canceling' | 'aborted' | 'complete'
  declare class Sources {
    static create: (module: ThisModule) => Promise<Sources>
    uniqueSources: string[]
    defaultSources: string[]
    activeSources: () => Promise<string[]>
  }
  declare class ThisModule {
    static isValidSystem (systemId: unknown): systemId is ValidSystems
    static isFoundryModule (moduleDocument: unknown): moduleDocument is FoundryModule
    static Error: (message: string) => Error
    static getModule (): ThisModule
    static getSources (): Sources
    static init: () => void
    readonly module: RTLB.FoundryModule
    readonly system: ValidSystems
    readonly thisClass: any
    readonly sources: Sources
    setSources: (sources: Sources) => void
    readonly status: ModuleStatus
    async setStatus (newStatus: RTLB.ModuleStatus): Promise<void>
    readonly interface: Application
    error: (message: string, localize: boolean = true) => Error
    async render (force?: boolean, options?: RenderOptions): Promise<Application>
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
