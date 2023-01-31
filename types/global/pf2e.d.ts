
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
