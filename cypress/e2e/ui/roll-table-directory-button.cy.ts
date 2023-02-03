import meta from '../../../src/module.json'
describe('ui/roll-table-directory-button.ts', { testIsolation: false }, () => {
  before('Load Foundry', () => {
    cy.login({ world: 'PF2e' })
  })
  afterEach('Close interface', () => {
    cy.closeFoundryApp(`${meta.name}-ready-interface`)
  })
  describe('Behaves correctly by', () => {
    it('displaying styles', () => {
      cy.get(`#${meta.name}-ready-content`)
        .should('not.exist')
        .get('#sidebar-tabs a[data-tab="tables"]')
        .click()
        .get(`#${meta.name}-open-main-interface-button img`)
        .should('have.css', 'border-width', '0px')
    })
    it('rendering interface when button is clicked', () => {
      cy.get(`#${meta.name}-ready-content`)
        .should('not.exist')
        .get('#sidebar-tabs a[data-tab="tables"]')
        .click()
        .get(`#${meta.name}-open-main-interface-button`)
        .click()
        .get(`section[id=${meta.name}-ready-content]`)
        .should('be.visible')
    })
    it('rendering interface when contained img is clicked', () => {
      cy.get(`#${meta.name}-ready-content`)
        .should('not.exist')
        .get('#sidebar-tabs a[data-tab="tables"]')
        .click()
        .get(`#${meta.name}-open-main-interface-button img`)
        .click()
        .get(`section[id=${meta.name}-ready-content]`)
        .should('be.visible')
    })
    it('handling render error', () => {
      cy.waitModuleReady()
        .then(mod => {
          expect(mod === undefined).to.be.false
          cy.wrap(mod?.interface.close())
            .then(() => {
              cy.stub(mod.interface, 'render')
                .throws('INTENTIONAL ERROR')
              cy.get('#sidebar-tabs a[data-tab="tables"]')
                .click()
                .try(['INTENTIONAL ERROR'])
                .get(`#${meta.name}-open-main-interface-button`)
                .click()
                .caught()
                .its('length')
                .should('eq', 1)
                .caught()
                .invoke('at', 0)
                .should('contain', 'INTENTIONAL ERROR')
            })
        })
    })
  })
})
