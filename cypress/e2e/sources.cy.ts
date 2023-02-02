import moduleInfo from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
import config from '../../src/config.json'

describe('sources', () => {
  it('Throws on invalid system', () => {
    cy.try([`${moduleInfo.title}: ${i18n.RTLB.InvalidGameSystem}`])
      .login({
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
      .caught()
      .its('length')
      .should('eq', 1)
      .caught()
      .invoke('at', 0)
      .should('contain', `${moduleInfo.title}: ${i18n.RTLB.InvalidGameSystem}`)
  })
  it('Throws if it can\'t get  the pf2e equipment compendium', () => {
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
  it('Freezes uniqueSources/defaultSources, registerSettings, gathers activeSources', () => {
    cy.login({
      world: 'PF2e'
    })
      .then(module => {
        // Check that uniqueSources is frozen
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
        // Check that defaultSources is frozen
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
        // Check that settings got registered
        cy.window()
          .its('game')
          .its('settings')
          .then(settings => {
            cy.wrap(module)
              .its('sources')
              .then(sources => {
                cy.wrap(sources.uniqueSources)
                  .each(source => {
                    const value = settings.get(moduleInfo.name, source)
                    expect(value).to.not.be.undefined
                    expect(sources.defaultSources.includes(source) === value).to.be.true
                  })
              })
          })
        // Active Sources should match Default Sources
        cy.wrap(module)
          .its('sources')
          .then(sources => {
            const activeSources = sources.activeSources
            expect(sources.defaultSources.length).to.eq(activeSources.length)
            cy.wrap(sources.defaultSources)
              .each(source => {
                expect(activeSources.includes(source)).to.be.true
              })
          })
      })
  })
})
