import moduleInfo from '../../../src/module.json'

describe('Module', () => {
  it('Loads DnD5e', () => {
    cy.login({ world: 'DnD 5e' })
    cy.window().its('game').then(game => {
      expect((game.modules.get(moduleInfo.name) as FoundryModule).interface).to.not.be.undefined
      expect(game.system.id).to.eq('dnd5e')
    })
  })
})
