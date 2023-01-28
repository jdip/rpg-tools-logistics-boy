describe('Config Sources', () => {
  beforeEach('Open Config', () => {
    cy.login()
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
