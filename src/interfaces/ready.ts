import meta from '../module.json'
import { getCommonData, type GetDataResults } from './helpers'
export class Ready extends Application {
  static override get defaultOptions (): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${meta.name}-ready-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${meta.name}/templates/ready.hbs`,
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

  async getData (): Promise<GetDataResults> {
    return {
      ...getCommonData(),
      buttons: [
        {
          type: 'submit',
          title: 'RTLB.SaveChanges',
          icon: 'fa-save'
        },
        {
          title: 'RTLB.SaveChanges',
          icon: 'fa-save',
          action: 'save'
        }
      ]
    }
  }
}
