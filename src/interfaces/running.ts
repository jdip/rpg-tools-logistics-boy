import meta from '../module.json'
import { activateButtons, getCommonData, type GetDataResults } from './helpers'

export class Running extends Application {
  static override get defaultOptions (): ApplicationOptions {
    console.log('RUNNING DEFAULTS')
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${meta.name}-running-interface`,
      title: 'RPG.Tools: LogisticsBoy',
      template: `modules/${meta.name}/templates/running.hbs`,
      width: 720,
      height: 720
    }) as ApplicationOptions
  }

  constructor (module: RTLB.ThisModule, options?: ApplicationOptions) {
    super(options)
    this._module = module
    console.log('RUNNING', this._module)
  }

  private readonly _module: RTLB.ThisModule

  async getData (): Promise<GetDataResults & { processes: Array<{ title: string, status: string }> }> {
    console.log('GETDATA')
    return {
      ...getCommonData(),
      processes: [],
      buttons: []
    }
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    console.log('ACTIVATE')
    super.activateListeners(html)
    activateButtons(new Map([
    ]), html)
  }
}
