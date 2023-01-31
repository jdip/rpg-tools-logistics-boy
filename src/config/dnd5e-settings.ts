import { RTLBDnD5eConfigSources } from '../interfaces/dnd5e-config-sources'

const registerSettings = async (): Promise<void> => {
  RTLBDnD5eConfigSources.registerSettings()
}

export { registerSettings }
