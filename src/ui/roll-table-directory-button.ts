import meta from '../module.json'
import { reportError } from '../helpers'

export const renderRollTableDirectoryButton = (html: JQuery, main: RTLB.Main): void => {
  const button = $(
    `<button id="rtlb-open-main-interface-button" class="cc-sidebar-button" data-action="rtlb-open-interface" type="button">
       <img class="rtlb-open-main-interface-icon" alt="${meta.title} Icon" width="14" height="14" src="/modules/${meta.name}/svg/hand-truck-black.svg">
       <span>LogisticsBoy</span>
     </button>`
  )
  button.on('click', () => {
    if (!main.isReady) throw reportError('RTLB.Error.ModuleNotReady');
    (async () => {
      await main.interface.render(true)
    })().catch(error => {
      throw reportError(error, false)
    })
  })
  html.find('.directory-header .action-buttons').append(button)
}
