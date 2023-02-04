import meta from '../module.json'
import { reportError } from '../helpers'

export const renderRollTableDirectoryButton = (html: JQuery, main: RTLB.ThisModule, readyComplete: () => boolean): void => {
  const button = $(
    `<button id="${meta.name}-open-main-interface-button" class="cc-sidebar-button" data-action="${meta.name}-open-interface" type="button">
       <img class="${meta.name}-open-main-interface-icon" alt="${meta.title} Icon" width="14" height="14" src="/modules/${meta.name}/svg/hand-truck-black.svg">
       <span>LogisticsBoy</span>
     </button>`
  )
  button.on('click', () => {
    if (!readyComplete()) throw reportError('RTLB.ModuleNotReady')
    main.render(true)
      .catch(error => {
        throw reportError(error, false)
      })
  })
  html.find('.directory-header .action-buttons').append(button)
}
