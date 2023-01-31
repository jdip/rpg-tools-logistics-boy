import moduleInfo from '../module.json'
import { itemSources, defaultPacks } from '../config/pf2e-sources'

interface ConfigSourceFormData {
  sources: Array<{ title: string, name: string, value: boolean }>
}
export class RTLBPF2eConfigSources extends FormApplication {
  static override get defaultOptions (): FormApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${moduleInfo.name}-pf2e-config-sources-app`,
      title: `${moduleInfo.title}: LogisticsBoy ${game.i18n.localize('RTLB.Sources')}`,
      template: `modules/${moduleInfo.name}/templates/config-sources.hbs`,
      width: 880,
      height: 720,
      closeOnSubmit: true,
      submitOnClose: true
    }) as FormApplicationOptions
  }

  static registerSettings (): void {
    itemSources.forEach(source => {
      game.settings.register(moduleInfo.name, source, {
        name: source,
        scope: 'world',
        config: false,
        type: Boolean,
        default: defaultPacks.includes(source)
      })
    })

    game.settings.registerMenu(moduleInfo.name, 'sourceMenu', {
      name: game.i18n.localize('RTLB.ConfigureCompendiumSources'),
      label: game.i18n.localize('RTLB.UpdateSources'),
      hint: game.i18n.localize('RTLB.SelectCompendiumPacksUsed'),
      icon: 'fas fa-list',
      type: RTLBPF2eConfigSources,
      restricted: true
    })
  }

  async getData (): Promise<FormApplicationData<ConfigSourceFormData> & { moduleInfo: Record<string, any> }> {
    return {
      moduleInfo,
      object: {
        sources: itemSources.map(source => {
          return {
            title: source.replace('Pathfinder ', ''),
            name: source,
            value: game.settings.get('rpg-tools-logistics-boy', source)
          }
        })
      }
    }
  }

  async _updateObject (_event: Event, formData: Record<string, unknown>): Promise<void> {
    const data = expandObject<Record<'sources', string[]>>(formData)
    await Promise.all(itemSources.map(async (source) => {
      await game.settings.set(moduleInfo.name, source, data.sources.includes(source))
    }))
  }

  override activateListeners (html: JQuery<HTMLElement>): void {
    super.activateListeners(html)
    html
      .find(`.${moduleInfo.name}-action`)
      .on('click', (event: JQuery.TriggeredEvent) => {
        this._onClickButton(event)
          .catch(err => {
            ui?.notifications?.error(
              `${moduleInfo.title}: ${game.i18n.localize('RTLB.UnexpectedError')}, ${game.i18n.localize('RTLB.ReportBugsAt')} ${moduleInfo.bugs}.`
            )
            console.error(err)
          })
      })
  }

  private async _onClickButton (event: JQuery.TriggeredEvent): Promise<void> {
    event.preventDefault()
    const button = (event.target) as HTMLElement
    const action = button.dataset.action
    switch (action) {
      case 'select-all':
        await this._selectAll()
        break
      case 'select-default':
        await this._selectDefault()
        break
      case 'select-none':
        await this._selectNone()
        break
      default:
        throw new Error(`${game.i18n.localize('RTLB.UnexpectedButtonAction')}: ${action ?? 'none'}`)
    }
  }

  private async _selectAll (): Promise<void> {
    const inputs = $(`#${moduleInfo.name}-config-sources-content form.${moduleInfo.name}-config-sources-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = true
    })
  }

  private async _selectDefault (): Promise<void> {
    const inputs = $(`#${moduleInfo.name}-config-sources-content form.${moduleInfo.name}-config-sources-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(i => {
      const input = (i as HTMLInputElement)
      input.checked = defaultPacks.includes(input.value)
    })
  }

  private async _selectNone (): Promise<void> {
    const inputs = $(`#${moduleInfo.name}-config-sources-content form.${moduleInfo.name}-config-sources-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
  }
}
