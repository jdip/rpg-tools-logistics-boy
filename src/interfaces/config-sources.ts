import meta from '../../src/module.json'
import { type GetDataFormResults, getCommonData, activateButtons } from './helpers'

export const registerConfigSources = (mod: RTLB.Main): void => {
  const ConfigSources = class extends FormApplication {
    static override get defaultOptions (): FormApplicationOptions {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: `${meta.name}-config-sources-app`,
        title: `${meta.title}: ${game.i18n.localize('RTLB.Sources')}`,
        template: `modules/${meta.name}/templates/config-sources.hbs`,
        width: 880,
        height: 720,
        closeOnSubmit: true,
        submitOnClose: true
      }) as FormApplicationOptions
    }

    constructor (...args: any[]) {
      super(...args)
      this._module = mod
    }

    private readonly _module: RTLB.Main

    async getData (): Promise<GetDataFormResults> {
      const activeSources = await this._module.sources.activeSources()
      return {
        ...getCommonData(),
        object: {
          sources: this._module.sources.uniqueSources.map(source => {
            return {
              name: source,
              title: source.replace(/^Pathfinder\s+/, ''),
              value: activeSources.includes(source)
            }
          })
        },
        buttons: [
          {
            type: 'submit',
            title: 'RTLB.SaveChanges',
            icon: 'fa-save'
          }
        ]
      }
    }

    async _updateObject (_event: Event, formData: Record<string, unknown>): Promise<void> {
      const data = expandObject<Record<'sources', string[]>>(formData)
      await Promise.all(this._module.sources.uniqueSources.map(async (source) => {
        await game.settings.set(meta.name, source, data.sources.includes(source))
      }))
    }

    override activateListeners (html: JQuery<HTMLElement>): void {
      super.activateListeners(html)
      activateButtons(new Map([
        ['select-all', this._selectAll.bind(this)],
        ['select-default', this._selectDefault.bind(this)],
        ['select-none', this._selectNone.bind(this)]
      ]), html)
    }

    private async _selectAll (): Promise<void> {
      const inputs = $(`#${meta.name}-config-sources-content form.${meta.name}-config-sources-form input`)
      inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
        (input as HTMLInputElement).checked = true
      })
    }

    private async _selectDefault (): Promise<void> {
      const inputs = $(`#${meta.name}-config-sources-content form.${meta.name}-config-sources-form input`)
      inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(i => {
        const input = (i as HTMLInputElement)
        input.checked = this._module.sources.defaultSources.includes(input.value)
      })
    }

    private async _selectNone (): Promise<void> {
      const inputs = $(`#${meta.name}-config-sources-content form.${meta.name}-config-sources-form input`)
      inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
        (input as HTMLInputElement).checked = false
      })
    }
  }

  game.settings.registerMenu(meta.name, 'sourceMenu', {
    name: game.i18n.localize('RTLB.ConfigureCompendiumSources'),
    label: game.i18n.localize('RTLB.UpdateSources'),
    hint: game.i18n.localize('RTLB.SelectCompendiumPacksUsed'),
    icon: 'fas fa-list',
    type: ConfigSources,
    restricted: true
  })
}
