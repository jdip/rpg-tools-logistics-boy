
declare const ui: FoundryUI
declare const game: Game

declare namespace RTLB {
  type ValidSystems = 'pf2e' | 'dnd5e'
  type ModuleStatus = 'ready' | 'running' | 'canceling' | 'aborted' | 'complete'
  class ThisModule {
    static Error: (message: string) => Error
    static setup: () => void
    readonly system: ValidSystems
    readonly status: ModuleStatus
    error: (message: string, localize: boolean = true) => Error
    async render (force?: boolean, options?: RenderOptions): Promise<Application>
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
