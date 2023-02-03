import meta from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
describe('main.ts', () => {
  describe('Throws during setup if', () => {
    it('the module isn\'t loaded', () => {
      cy.try([`${meta.title}: ${i18n.RTLB.ModuleNotLoaded}`])
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
        .its('length')
        .should('eq', 2)
        .caught()
        .invoke('at', 0)
        .should('contain', `${meta.title}: ${i18n.RTLB.ModuleNotLoaded}`)
        .caught()
        .invoke('at', 1)
        .should('contain', `${meta.title}: ${i18n.RTLB.ModuleNotLoaded}`)
    })
    it('if game.system.id isn\'t valid', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.InvalidGameSystem}`,
        `${meta.title}: ${i18n.RTLB.MainModuleUndefined}`
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
        .its('length')
        .should('eq', 2)
        .caught()
        .invoke('at', 0)
        .should('contain', `${meta.title}: ${i18n.RTLB.InvalidGameSystem}`)
        .caught()
        .invoke('at', 1)
        .should('contain', `${meta.title}: ${i18n.RTLB.MainModuleUndefined}`)
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
          mod._status = 'ready'
        })
    })
    it('setting up sources', () => {
      cy.waitModuleReady()
        .then(mod => {
          cy.wrap(mod)
            .its('sources')
            .should('not.be.undefined')
            .wrap(mod.thisClass.getSources())
            .its('uniqueSources')
            .should('have.length.gt', 0)
        })
    })
    it('handling status changes', done => {
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
    it('notifying errors', () => {
      cy.window().its('ui').its('notifications').then(notifications => {
        cy.spy(notifications, 'error').as('uiNotifyError')
        cy.window().its('game').then(game => {
          const mod = game.modules.get(meta.name).main
          const err1 = mod.error('RTLB.ModuleNotLoaded')
          expect(err1.message).to.eq(`${meta.title}: ${i18n.RTLB.ModuleNotLoaded}`)
          cy.get('@uiNotifyError').should('be.calledWith', `${meta.title}: ${i18n.RTLB.ModuleNotLoaded}`)

          const notLocalized = 'NOT LOCALIZED'
          const err2 = mod.error(notLocalized, false)
          expect(err2.message).to.eq(`${meta.title}: ${notLocalized}`)
          cy.get('@uiNotifyError').should('be.calledWith', `${meta.title}: ${notLocalized}`)
        })
      })
    })
  })
})
