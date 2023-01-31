import moduleInfo from '../module.json'
const renderRollTableDirectoryButton = (_: Application, html: JQuery, main: RTLB.ThisModule): void => {
  const button = $(
    `<button id="${moduleInfo.name}-open-main-interface-button" class="cc-sidebar-button" type="button">
       <img class="${moduleInfo.name}-open-main-interface-icon" alt="${moduleInfo.title} Icon" width="14" height="14" src="/modules/${moduleInfo.name}/svg/hand-truck-black.svg">
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
