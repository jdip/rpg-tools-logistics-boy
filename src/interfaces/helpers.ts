import meta from '../module.json'
import config from '../config.json'

export type GetDataResults =
  FormApplicationData<Record<string, unknown>> &
  ReturnType<typeof getCommonData> &
  {
    buttons?: Array<{
      type?: string
      title?: string
      icon?: string
      iconAnimation?: string
      action?: string
    }>
  }

export type GetDataFormResults =
  FormApplicationData<Record<string, unknown>> &
  GetDataResults

export type ActionMap = Map<string, (...args: any[]) => void | Promise<void>>
export function getCommonData (): { meta: typeof meta, partials: Record<string, string> } {
  return {
    meta,
    partials: config.partials.reduce((acc, partial: string) => {
      return { ...acc, [partial]: () => `modules/${meta.name}/templates/partials/${partial}.hbs` }
    }, {})
  }
}

export function activateButtons (actionMap: ActionMap, html: JQuery<HTMLElement>): void {
  html
    .find(`.${meta.name}-action`)
    .on('click', (event: JQuery.TriggeredEvent) => {
      onClickButton(actionMap, event)
        .catch(err => {
          ui?.notifications?.error(
            `${meta.title}: ${game.i18n.localize('RTLB.UnexpectedError')}, ${game.i18n.localize('RTLB.ReportBugsAt')} ${meta.bugs}.`
          )
          console.error(err)
        })
    })
}

async function onClickButton (actionMap: ActionMap, event: JQuery.TriggeredEvent): Promise<void> {
  event.preventDefault()
  const button = (event.target) as HTMLElement
  const requestedAction = button.dataset.action
  for (const [action, callback] of actionMap) {
    if (action === requestedAction) {
      await callback()
      return
    }
  }
  throw new Error(`${game.i18n.localize('RTLB.UnexpectedButtonAction')}: ${requestedAction ?? 'none'}`)
}
