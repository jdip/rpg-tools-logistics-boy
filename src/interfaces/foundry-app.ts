import moduleInfo from '../module.json'

export class FoundryApp extends Application {
  override getData (): { meta: typeof moduleInfo } {
    return {
      meta: moduleInfo
    }
  }
}
