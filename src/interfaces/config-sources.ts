import moduleInfo from '../../src/module.json'
export class ConfigSources extends FormApplication {
  static override get defaultOptions (): FormApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${moduleInfo.name}-config-sources-app`,
      title: `${moduleInfo.title}: ${game.i18n.localize('RTLB.Sources')}`,
      template: `modules/${moduleInfo.name}/templates/config-sources.hbs`,
      width: 880,
      height: 720,
      closeOnSubmit: true,
      submitOnClose: true
    }) as FormApplicationOptions
  }

  static registerSettings (): void {
    console.log('REGISTER SETTINGS')
  }

  static registerMenu (): void {
    game.settings.registerMenu(moduleInfo.name, 'sourceMenu', {
      name: game.i18n.localize('RTLB.ConfigureCompendiumSources'),
      label: game.i18n.localize('RTLB.UpdateSources'),
      hint: game.i18n.localize('RTLB.SelectCompendiumPacksUsed'),
      icon: 'fas fa-list',
      type: ConfigSources,
      restricted: true
    })
  }

  async getData (): Promise<FormApplicationData<Record<string, unknown>> & { meta: typeof moduleInfo }> {
    return {
      meta: moduleInfo,
      object: {
      }
    }
  }

  async _updateObject (_event: Event, formData: Record<string, unknown>): Promise<void> {
    const data = expandObject<Record<'sources', string[]>>(formData)
    console.log('UPDATE', data)
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
      input.checked = false // defaultPacks.includes(input.value)
    })
  }

  private async _selectNone (): Promise<void> {
    const inputs = $(`#${moduleInfo.name}-config-sources-content form.${moduleInfo.name}-config-sources-form input`)
    inputs.toArray().filter(input => input instanceof HTMLInputElement).forEach(input => {
      (input as HTMLInputElement).checked = false
    })
  }
}
