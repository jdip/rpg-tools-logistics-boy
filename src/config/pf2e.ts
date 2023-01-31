import { getUniqueItemSources } from './pf2e-sources'
import { registerSettings } from './pf2e-settings'

const preparePF2e = (): void => {
  Hooks.once('ready', async () => {
    await getUniqueItemSources()
    await registerSettings()
  })
}

export { preparePF2e }
