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
              .end()
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
                    console.log('closed')
                    let thrown = 0
                    cy.on('uncaught:exception', error => {
                      thrown = thrown + 1
                      switch (thrown) {
                        case 1:
                          expect(error.message.includes('INTENTIONAL ERROR')).to.be.true
                          return false
                        default:
                          expect('Should not have reached here').to.eq('but did')
                      }
                      return true
                    })
                    cy.stub((module as RTLB.ThisModule).interface, 'render')
                      .throws('INTENTIONAL ERROR')
                    cy.get(`#${moduleInfo.name}-open-main-interface-button img`)
                      .click()
                      .then(() => {
                        expect(thrown).to.eq(1)
                      })
                  })
                })
          })
      })
  })
})
