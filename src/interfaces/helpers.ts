import meta from '../module.json'
import config from '../config.json'
import { reportError } from '../helpers'

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
      disabled?: boolean
    }>
  }

export type GetDataFormResults =
  FormApplicationData<Record<string, unknown>> &
  GetDataResults

export type ActionMap = Map<string, (...args: any[]) => void | Promise<void>>
export function getCommonData (): { meta: typeof meta, partials: Record<string, () => string> } {
  return {
    meta,
    partials: config.partials.reduce((acc, partial: string) => {
      return { ...acc, [partial]: () => `modules/${meta.name}/templates/partials/${partial}.hbs` }
    }, {})
  }
}

export function activateButtons (actionMap: ActionMap, html: JQuery<HTMLElement>): void {
  html
    .find('.rtlb-action')
    .on('click', (event: JQuery.TriggeredEvent) => {
      onClickButton(actionMap, event)
        .catch(err => {
          throw reportError(err)
        })
    })
}

export function getClickedWidget (event: JQuery.TriggeredEvent): HTMLButtonElement | HTMLAnchorElement {
  let button: HTMLElement = event.target
  while (!(button instanceof HTMLButtonElement) && !(button instanceof HTMLAnchorElement)) {
    if (button.parentElement === null) {
      throw reportError('RTLB.Error.NoButtonOrAnchorInParentChain')
    }
    button = button.parentElement
  }
  return button
}

async function onClickButton (actionMap: ActionMap, event: JQuery.TriggeredEvent): Promise<void> {
  event.preventDefault()
  const button: HTMLElement = getClickedWidget(event)
  const requestedAction = button.dataset.action
  for (const [action, callback] of actionMap) {
    if (action === requestedAction) {
      await callback(event)
      return
    }
  }
  throw reportError(`${game.i18n.localize('RTLB.UnexpectedButtonAction')} - ${requestedAction ?? 'none'}`)
}
