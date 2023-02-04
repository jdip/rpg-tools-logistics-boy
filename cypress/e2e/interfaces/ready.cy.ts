import meta from '../../../src/module.json'

describe('interfaces/ready.ts', { testIsolation: false }, () => {
  before('Load Foundry', () => {
    cy.login({ world: 'PF2e' })
  })
  beforeEach('open interface', () => {
    cy.clickSidebarButton('tables', `${meta.name}-open-interface`)
  })
  afterEach('close interface', () => {
    // cy.closeFoundryApp(`${meta.name}-ready-interface`)
  })
  describe('Renders correctly by', () => {
    it('displaying styles', () => {
      cy.get(`#${meta.name}-ready-content header`)
        .should('have.css', 'background-color', 'rgb(0, 0, 0)')
    })
  })
})
