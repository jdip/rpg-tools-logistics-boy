import meta from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
describe('main.ts', () => {
  describe('Throws during setup if', () => {
    it('the module isn\'t loaded', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.ModuleNotLoaded}`,
        `${meta.title}: ${i18n.RTLB.ModuleNotSetup}`
      ])
        .login({
          world: 'PF2e',
          onFoundryLoad: () => {
            cy.window().its('game').its('system').then(() => {
              cy.window().its('game').then(game => {
                cy.stub(game.modules, 'get').returns(undefined)
              })
            })
          },
          skipModuleReady: true
        })
        .caught()
    })
    it('if game.system.id isn\'t valid during setup', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.InvalidGameSystem}`,
        `${meta.title}: ${i18n.RTLB.ModuleNotSetup}`
      ])
        .login({
          world: 'PF2e',
          onFoundryLoad: () => {
            cy.window().its('game').its('system').then(system => {
              system.id = 'BAD SYSTEM'
            })
          },
          skipModuleReady: true
        })
        .caught()
    })
    it('if game.system.id isn\'t valid during ready', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.InvalidGameSystem}`
      ])
        .login({
          world: 'PF2e',
          onFoundryLoad: () => {
            cy.window()
              .its('Hooks')
              .then(Hooks => {
                cy.window()
                  .its('game')
                  .then(game => {
                    Hooks.on('setup', () => {
                      const foundryModule = game.modules.get(meta.name)
                      foundryModule.main.system = 'BAD SYSTEM'
                    })
                  })
              })
          },
          skipModuleReady: true
        })
        .caught()
    })
  })
  describe('Behaves correctly by', { testIsolation: false }, () => {
    before('Load Foundry', () => {
      cy.login({ world: 'PF2e' })
    })
    afterEach('reset status', () => {
      cy.window()
        .its('game')
        .its('modules')
        .then(modules => {
          const mod = modules.get(meta.name)
          mod.main._status = 'ready'
        })
    })
    afterEach('close interfaces', () => {
      cy.window()
        .its('$')
        .then($ => {
          cy.wrap<string[]>([
            'ready',
            'running',
            'canceling',
            'aborted',
            'complete'
          ]).each((app: string) => {
            const id = `${meta.name}-${app}-interface`
            if ($(`#${id}`)[0] !== undefined) {
              cy.closeFoundryApp(id)
            }
          })
        })
    })
    it('setting up sources', () => {
      cy.waitModuleReady()
        .then(mod => {
          cy.wrap(mod)
            .its('sources')
            .should('not.be.undefined')
            .its('uniqueSources')
            .should('have.length.gt', 0)
        })
    })
    describe('handling status changes', () => {
      it('from ready to running', () => {
        cy.waitModuleReady()
          .then(mod => {
            cy.spy(mod, 'render').as('spyRender')
            cy.wrap(mod)
              .its('_interface.constructor.name')
              .should('eq', 'Ready')
              .wrap(mod)
              .its('status')
              .should('eq', 'ready')
              .then(() => {
                cy.wrap(mod)
                  .its('_interface')
                  .then(_interface => {
                    cy.spy(_interface, 'close').as('spyClose')
                  })
                  .wrap(mod)
                  .invoke('setStatus', 'running')
                  .get('@spyRender')
                  .should('have.been.called')
                  .get('@spyClose')
                  .should('have.been.called')
                  .get(`#${meta.name}-running-interface`)
                  .should('be.visible')
              })
          })
      })
      it('to a bad status', done => {
        cy.waitModuleReady()
          .then(mod => {
            expect(mod.status).to.eq('ready')
            cy.spy(mod, 'render').as('spyRender')
            cy.wrap(mod.setStatus('ready'))
              .then(() => {
                cy.get('@spyRender').should('not.be.called')
                // @ts-expect-error: intentionally modifying a private property
                mod._status = 'NOT READY'
              })
              .then(() => {
                cy.wrap(mod.setStatus('ready')).then(() => {
                  expect(mod.interface.constructor.name === 'Ready')
                  cy.get('@spyRender').should('be.calledOnce')
                    .then(() => {
                      // @ts-expect-error: intentionally setting a bad status
                      mod.setStatus('BAD STATUS')
                        .then(() => {
                          expect('Should have errored').to.eq('but didn\'t')
                          done()
                        })
                        .catch((error: Error) => {
                          expect(error.message).to.contain(`${meta.title}: ${i18n.RTLB.InvalidInterfaceStatus}`)
                          done()
                        })
                    })
                })
              })
          })
      })
    })
  })
})
