import moduleInfo from '../../../src/module.json'
describe('ui/roll-table-directory-button', () => {
  it('is styled, opens main interface, & handles render error', () => {
    cy.login({
      world: 'PF2e'
    })
      .then(module => {
        cy.window()
          .then(() => {
            cy.get(`#${moduleInfo.name}-ready-content`)
              .should('not.exist')
              .get('#sidebar-tabs a[data-tab="tables"]')
              .click()
              .get(`#${moduleInfo.name}-open-main-interface-button img`)
              .should('have.css', 'border-width', '0px')
              .click()
              .get(`section[id=${moduleInfo.name}-ready-content]`)
              .should('be.visible')
              .then(() => {
                expect(module === undefined).to.be.false
                cy.wrap(module?.interface.close())
                  .then(() => {
                    cy.stub((module as RTLB.ThisModule).interface, 'render')
                      .throws('INTENTIONAL ERROR')

                    cy.try(['INTENTIONAL ERROR'])
                      .get(`#${moduleInfo.name}-open-main-interface-button img`)
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
})
