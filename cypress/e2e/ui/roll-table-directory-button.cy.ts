import meta from '../../../src/module.json'
import i18n from '../../../assets/lang/en.json'

describe('ui/roll-table-directory-button.ts', () => {
  describe('Throws', () => {
    it('when button is clicked before module is ready', () => {
      cy.login({
        world: 'PF2e',
        onFoundryLoad: () => {
          cy.try([`${meta.title}: ${i18n.RTLB.Error.ModuleNotReady}`])
            .get('#sidebar-tabs a[data-tab="tables"]')
            .click()
            .get(`#${meta.name}-open-main-interface-button`)
            .click()
            .caught()
        }
      })
    })
  })
  describe('Behaves correctly by', { testIsolation: false }, () => {
    before('Load Foundry', () => {
      cy.login({ world: 'PF2e' })
    })
    afterEach('Close interface', () => {
      cy.closeFoundryApp(`${meta.name}-ready-interface`)
    })
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
    it('handling a render error', () => {
      cy.waitMainReady()
        .then(main => {
          expect(main === undefined).to.be.false
          cy.wrap(main?.interface.close())
            .then(() => {
              cy.stub(main.interface, 'render', () => {
                throw new Error('INTENTIONAL ERROR')
              })
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
