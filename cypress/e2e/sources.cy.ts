import moduleInfo from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
import config from '../../src/config.json'

describe('sources', () => {
  it('Throws on invalid system', () => {
    let thrown = 0
    cy.on('uncaught:exception', error => {
      thrown = thrown + 1
      switch (thrown) {
        case 1:
          expect(error.message.includes(`${moduleInfo.title}: ${i18n.RTLB.InvalidGameSystem}`)).to.be.true
          return false
        default:
          expect('Should not have reached here').to.eq('but did')
      }
      return true
    })
    cy.login({
      world: 'PF2e',
      onFoundryLoad: () => {
        cy.window()
          .its('Hooks')
          .then(Hooks => {
            cy.window()
              .its('game')
              .its('modules')
              .invoke('get', moduleInfo.name)
              .then(module => {
                Hooks.once('setup', () => {
                  module.main.system = 'BAD SYSTEM'
                })
              })
          })
      },
      skipModuleReady: true
    })
      .then(() => {
        expect(thrown).to.eq(1)
      })
  })
  it.only('Throws if it can\'t get  the pf2e equipment compendium', () => {
    cy.try([`${moduleInfo.title}: ${i18n.RTLB.EquipmentCompendiumNotInitialized}`])
      .login({
        world: 'PF2e',
        onFoundryLoad: () => {
          cy.window()
            .its('game')
            .its('packs')
            .invoke('get', config.pf2e.packs[0])
            .should('not.be.undefined')
            .then(() => {
              cy.window()
                .its('game')
                .its('packs')
                .then(packs => {
                  cy.stub(packs, 'get').returns(undefined)
                })
            })
        },
        skipModuleReady: true
      })
      .caught()
      .its('length')
      .should('eq', 1)
      .caught()
      .invoke('at', 0)
      .should('contain', `${moduleInfo.title}: ${i18n.RTLB.EquipmentCompendiumNotInitialized}`)
  })
  it('Freezes uniqueSources & defaultSources', () => {
    cy.login({
      world: 'PF2e'
    })
      .then(module => {
        cy.wrap(module)
          .its('sources')
          .its('uniqueSources')
          .then(uniqueSources => {
            try {
              uniqueSources.push('TEST')
            } catch (error: unknown) {
              expect(`${error}`.includes('Cannot add property')).to.be.true
            }
          })
        cy.wrap(module)
          .its('sources')
          .its('defaultSources')
          .then(defaultSources => {
            try {
              defaultSources.push('TEST')
            } catch (error: unknown) {
              expect(`${error}`.includes('Cannot add property')).to.be.true
            }
          })
      })
  })
})
