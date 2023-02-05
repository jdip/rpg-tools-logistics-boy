// import meta from '../../src/module.json'

describe('tables.ts', () => {
  before('Login', () => {
    cy.login({ world: 'PF2e' })
  })
  describe('Throws during setup if', () => {
    it('it can\'t get  the pf2e equipment compendium', () => {
      cy.waitMainReady()
        .then(main => {
          cy.wrap(main.tables.buildAll([['Alchemist', 'potion']]))
        })
    })
  })
})
