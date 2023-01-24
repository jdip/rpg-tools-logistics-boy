/// <reference types="vite/client" />

type BuildInterfaceStatus = 'initialized' | 'running' | 'canceling' | 'aborted' | 'complete'

interface BuildInterfaceProcess {
  name: string
  icon: string
  iconAnimation?: string
}

interface BuildInterfaceButtonState {
  status: BuildInterfaceStatus
  title: string
  action: string
  icon: string
  iconAnimation?: string
}

interface BuildInterfaceData {
  status: BuildInterfaceStatus
  availableTables: string[]
  processes: BuildInterfaceProcess[] | undefined
  button: BuildInterfaceButtonProps
}
type BuildInterfaceProcessCallback = (message: string) => void

interface PathfinderItem extends Item {
  system: {
    category?: string
    group?: string
    rarity?: string
    traits?: { value: string[] }
    consumableType?: { value: string }
    stackGroup?: string
  }
}
