describe('Config Sources', () => {
  beforeEach('Open Config', () => {
    cy.login()
    cy.get('nav[id=sidebar-tabs] a[data-tab=settings]').click()
    cy.get('div[id=sidebar] section[id=settings] button[data-action=configure]').click()
    cy.get('div[id=client-settings] a[data-tab=rpg-tools-logistics-boy]').click()
    cy.get('div[id=client-settings] button[data-key="rpg-tools-logistics-boy.sourceMenu"]').click()
    cy.get('div[id=rpg-tools-logistics-boy-settings]').should('have.attr', 'style', 'z-index: 101; width: 880px; height: 720px; left: 520px; top: 180px;').wait(250)
  })
  afterEach('Close Config', () => {
    // cy.get('div[id=rpg-tools-logistics-boy-settings] > header > a.header-button.close').click()
    // cy.get('div[id=client-settings] > header > a.header-button.close').click()
  })
  it('Lists available sources', () => {
    cy.fixture('sources').then(sources => {
      cy.wrap(sources).each((source: string) => {
        it(`Lists: ${source}`, () => [
          cy.get(`section[id=rt-log-boy-config-sources] ul.rt-log-boy-checkbox-list input[value="${source}"]`).should('exist')
        ])
      })
    })
  })
})
