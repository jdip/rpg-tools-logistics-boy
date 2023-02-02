import moduleInfo from '../../../src/module.json'

const openInterface = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get('nav[id=sidebar-tabs] a[data-tab=settings]')
    .click()
    .get('div[id=sidebar] section[id=settings] button[data-action=configure]')
    .click()
    .get(`div[id=client-settings] a[data-tab=${moduleInfo.name}]`)
    .click()
    .get(`div[id=client-settings] button[data-key="${moduleInfo.name}.sourceMenu"]`)
    .click()
}
describe('interfaces/config-sources', () => {
  it('opens', () => {
    cy.login({ world: 'PF2e' })
      .then(() => {
        openInterface()
          .get(`#${moduleInfo.name}-config-sources-content header`)
          .should('have.css', 'background-color', 'rgb(0, 0, 0)')
      })
  })
})
