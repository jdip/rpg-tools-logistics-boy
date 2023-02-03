import meta from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
import config from '../../src/config.json'

const resetDefaultSettings = () => {
  cy.window().its('game').its('settings').then(settings => {
    cy.fixture<string[]>('defaultSources').then(defaultSources => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      cy.fixture<string[]>('sources').each((source: string) => {
        return settings.set(meta.name, source, defaultSources.includes(source))
      })
    })
  })
}
describe('sources.ts', () => {
  describe('Throws during setup if', () => {
    it('game system is invalid', () => {
      cy.try([`${meta.title}: ${i18n.RTLB.InvalidGameSystem}`])
        .login({
          world: 'PF2e',
          onFoundryLoad: () => {
            cy.window()
              .its('Hooks')
              .then(Hooks => {
                cy.window()
                  .its('game')
                  .its('modules')
                  .invoke('get', meta.name)
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
        .should('contain', `${meta.title}: ${i18n.RTLB.InvalidGameSystem}`)
    })
    it('it can\'t get  the pf2e equipment compendium', () => {
      cy.try([`${meta.title}: ${i18n.RTLB.EquipmentCompendiumNotInitialized}`])
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
        .should('contain', `${meta.title}: ${i18n.RTLB.EquipmentCompendiumNotInitialized}`)
    })
  })
  describe('Behaves correctly by', { testIsolation: false }, () => {
    before('Load Foundry', () => {
      cy.login({ world: 'PF2e' })
      resetDefaultSettings()
    })
    afterEach('reset defaults', () => {
      resetDefaultSettings()
    })
    it('registering settings', () => {
      cy.window()
        .its('game')
        .its('settings')
        .then(settings => {
          cy.fixture<string[]>('defaultSources')
            .then(defaultSources => {
            cy.fixture<string[]>('sources')
              .each((source: string) => {
                const value = settings.get(meta.name, source)
                expect(value).to.not.be.undefined
                expect(defaultSources.includes(source) === value).to.be.true
              })
            })
        })
    })
    it('producing frozen uniqueSources', () => {
      cy.waitModuleReady()
        .its('sources')
        .its('uniqueSources')
        .then(uniqueSources => {
          cy.fixture<string[]>('sources')
            .then(sources => {
              cy.arrayDiff(sources, uniqueSources)
                .should('have.length', 0)
            })
          try {
            uniqueSources.push('TEST')
          } catch (error: unknown) {
            expect(`${error}`.includes('Cannot add property')).to.be.true
            return
          }
          expect('Should not have arrived here').to.eq('but did')
        })
    })
    it('producing frozen defaultSources', () => {
      cy.waitModuleReady()
        .its('sources')
        .its('defaultSources')
        .then(defaultSources => {
          cy.fixture<string[]>('defaultSources')
            .then(defaultSources2 => {
              cy.arrayDiff(defaultSources, defaultSources2)
                .should('have.length', 0)
            })
          try {
            defaultSources.push('TEST')
          } catch (error: unknown) {
            expect(`${error}`.includes('Cannot add property')).to.be.true
            return
          }
          expect('Should not have arrived here').to.eq('but did')
        })
    })
    describe('producing activeSources that', () => {
      it('are frozen', () => {
        cy.waitModuleReady()
          .its('sources')
          .then(sources => {
            cy.wrap(sources.activeSources())
              .then(activeSources => {
                try {
                  (activeSources as string[]).push('TEST')
                } catch (error: unknown) {
                  expect(`${error}`.includes('Cannot add property')).to.be.true
                  return
                }
                expect('Should not have arrived here').to.eq('but did')
              })
          })
      })
      it('match defaults', () => {
        cy.waitModuleReady()
          .its('sources')
          .then(sources => {
            cy.fixture<string[]>('defaultSources')
              .then(defaultSources => {
                cy.wrap(sources.activeSources())
                  .then(activeSources => {
                    cy.arrayDiff((activeSources as string[]), defaultSources)
                      .should('have.length', 0)
                  })
              })
          })
      })
      it('update when settings are changed', () => {
        cy.waitModuleReady()
          .its('sources')
          .then(sources => {
            cy.window()
              .its('game')
              .its('settings')
              .then(settings => {
                cy.fixture<string[]>('defaultSources')
                  .then(defaultSources => {
                    cy.fixture<string[]>('sources')
                      // set all settings opposite of defaults
                      .each((source: string) => {
                        return settings.set(meta.name, source, !defaultSources.includes(source))
                      })
                      // the difference between all sources and active sources should now be the defaults
                      .then(allSources => {
                        cy.wrap(sources.activeSources())
                          .then(activeSources => {
                            cy.arrayDiff(allSources, (activeSources as string[]))
                              .then(difference => {
                                cy.arrayDiff(difference, defaultSources)
                                  .should('have.length', 0)
                              })
                          })
                      })
                  })
              })
          })
      })
    })
  })
})
