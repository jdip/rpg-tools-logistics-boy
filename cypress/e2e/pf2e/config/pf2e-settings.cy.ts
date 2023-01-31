import moduleInfo from '../../../../src/module.json'

describe('config/pf2e-settings', () => {
  beforeEach(() => {
    cy.login({ world: 'PF2e' })
  })
  it('registers all available equipment packs as settings', () => {
    cy.window().its('game').then(game => {
      const settings = [...game.settings.settings.keys()]
      cy.fixture('sources').then(sources => {
        cy.wrap(sources).each((source: string) => {
          expect(settings.includes(`${moduleInfo.name}.${source}`)).to.be.true
        })
      })
    })
  })
})
