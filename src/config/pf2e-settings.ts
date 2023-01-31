import { RTLBPF2eConfigSources } from '../interfaces/pf2e-config-sources'

const registerSettings = async (): Promise<void> => {
  RTLBPF2eConfigSources.registerSettings()
}

export { registerSettings }
