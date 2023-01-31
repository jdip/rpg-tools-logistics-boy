
declare const ui: FoundryUI
declare const game: Game
declare const CONFIG: any

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
