/// <reference types="vite/client" />

declare const ui: FoundryUI
declare const game: Game

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
  disabled: boolean
  icon: string
  iconAnimation?: string
}

interface BuildInterfaceData {
  status: BuildInterfaceStatus
  availableGroups: ItemGroupTest[]
  processes: BuildInterfaceProcess[] | undefined
  button: BuildInterfaceButtonProps
}
type BuildInterfaceProcessCallback = (message: string) => Promise<void>

interface ItemGroupTest {
  title: string
  details: string
  test: (item: PathfinderItem) => boolean
  weightAdjustments: Record<string, number>
}

interface PathfinderItem extends Item {
  id: string
  name: string
  system: {
    category?: string
    group?: string
    traits?: {
      rarity?: string
      value: string[]
    }
    consumableType?: { value: string }
    level?: { value: string }
    source?: { value: string }
    usage?: { value: string }
    stackGroup?: string
  }
}

interface PathfinderGame {
  collections: Map<string, RollTable>
}
