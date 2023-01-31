import moduleInfo from '../module.json'
import { FoundryApp } from './foundry-app'
export class Ready extends FoundryApp {
  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${moduleInfo.name}-ready-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${moduleInfo.name}/templates/ready.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (module: RTLB.ThisModule, options?: ApplicationOptions) {
    super(options)
    this._module = module
    console.log('Ready', this._module)
  }

  private readonly _module: RTLB.ThisModule
}
