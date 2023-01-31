import moduleInfo from '../../../src/module.json'

const badSystem = 'BAD SYSTEM'
describe('module', () => {
  it('Errors on bad system id', () => {
    cy.login({
      world: 'PF2e',
      onLoad: (win) => {
        cy.wrap(win).its('game').its('system').then(system => {
          system.id = badSystem
          cy.spy(win.console, 'error').as('spyWinConsoleError')
        })
      }
    })
    cy.window().its('game').then(game => {
      cy.get('@spyWinConsoleError')
        .should('be.calledOnceWith', `${moduleInfo.title}: Invalid game system: ${badSystem}`)
      expect((game.modules.get(moduleInfo.name) as FoundryModule).interface).to.be.undefined
    })
  })
  it('Loads PF2e', () => {
    cy.login({ world: 'PF2e' })
    cy.window().its('game').then(game => {
      expect((game.modules.get(moduleInfo.name) as FoundryModule).interface).to.not.be.undefined
      expect(game.system.id).to.eq('pf2e')
      cy.get('nav[id=sidebar-tabs] a[data-tab=tables]').click()
      cy.get(`button[id=${moduleInfo.name}-open-main-interface-button]`).click()
      cy.get(`#${moduleInfo.name}-main-interface-content > form > header`)
        .should('contain.text', 'LogisticsBoy')
        .should('have.css', 'background-color', 'rgb(0, 0, 0)')
    })
  })
})
