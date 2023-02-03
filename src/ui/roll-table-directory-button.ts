import meta from '../module.json'
const renderRollTableDirectoryButton = (html: JQuery, main: RTLB.ThisModule): void => {
  const button = $(
    `<button id="${meta.name}-open-main-interface-button" class="cc-sidebar-button" type="button">
       <img class="${meta.name}-open-main-interface-icon" alt="${meta.title} Icon" width="14" height="14" src="/modules/${meta.name}/svg/hand-truck-black.svg">
       <span>LogisticsBoy</span>
     </button>`
  )
  button.on('click', () => {
    main.render(true)
      .catch(error => {
        throw main.error(error, false)
      })
  })
  html.find('.directory-header .action-buttons').append(button)
}

export { renderRollTableDirectoryButton }
