import { getUniqueItemSources } from './dnd5e-sources'
import { registerSettings } from './dnd5e-settings'

const prepareDnD5e = (): void => {
  Hooks.once('ready', async () => {
    await getUniqueItemSources()
    await registerSettings()
  })
}

export { prepareDnD5e }
