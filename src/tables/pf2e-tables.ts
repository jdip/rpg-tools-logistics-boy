import { Alchemist } from './pf2e-groupings/alchemist'
import { Arcanist } from './pf2e-groupings/arcanist'

export class PF2eTables implements RTLB.Tables {
  readonly definitions = {
    Alchemist,
    Arcanist
  }

  static async create (module: RTLB.ThisModule): Promise<PF2eTables> {
    return new PF2eTables((module))
  }

  constructor (module: RTLB.ThisModule) {
    this._module = module
  }

  private readonly _module: RTLB.ThisModule

  async build (group: string, table: string): Promise<void> {
    console.log('BUILDING', group, table, this._module)
  }
}
