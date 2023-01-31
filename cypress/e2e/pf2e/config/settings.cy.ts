import moduleInfo from '../../../../src/module.json'
describe('Settings', () => {
  beforeEach('Open Config', () => {
    cy.login({ world: 'PF2e' })
    cy.get('nav[id=sidebar-tabs] a[data-tab=settings]').click()
    cy.get('div[id=sidebar] section[id=settings] button[data-action=configure]').click()
    cy.get(`div[id=client-settings] a[data-tab=${moduleInfo.name}]`).click()
    cy.get(`div[id=client-settings] button[data-key="${moduleInfo.name}.sourceMenu"]`).click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(`div[id=${moduleInfo.name}-pf2e-config-sources-app]`)
      .should('have.attr', 'style', 'z-index: 101; width: 880px; height: 720px; left: 520px; top: 180px;')
      .wait(250)
  })
  afterEach('Restore Defaults', () => {
    cy.window().its('game').its('settings').then(settings => {
      cy.fixture<string[]>('defaultSources').then(defaultSources => {
        cy.fixture<string[]>('sources').each((source: string) => {
          settings.set(moduleInfo.name, source, defaultSources.includes(source))
        })
      })
    })
  })
  it('displays styles', () => {
    cy.get(`#${moduleInfo.name}-config-sources-content > form > header`)
      .should('contain.text', 'LogisticsBoy')
      .should('have.css', 'background-color', 'rgb(0, 0, 0)')
  })
})
