import { RTLBConfigSources } from '../interfaces/config-sources'

const registerSettings = async (): Promise<void> => {
  RTLBConfigSources.registerSettings()
}

export { registerSettings }
