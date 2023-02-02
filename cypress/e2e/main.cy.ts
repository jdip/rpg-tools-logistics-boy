import moduleInfo from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
describe('main', () => {
  it('Throws if its module isn\'t loaded', () => {
    cy.try([`${moduleInfo.title}: ${i18n.RTLB.ModuleNotLoaded}`])
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
      .should('contain', `${moduleInfo.title}: ${i18n.RTLB.ModuleNotLoaded}`)
      .caught()
      .invoke('at', 1)
      .should('contain', `${moduleInfo.title}: ${i18n.RTLB.ModuleNotLoaded}`)
  })
  it('Throws if game.system.id isn\'t valid', () => {
    cy.try([
      `${moduleInfo.title}: ${i18n.RTLB.InvalidGameSystem}`,
      `${moduleInfo.title}: ${i18n.RTLB.MainModuleUndefined}`
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
      .should('contain', `${moduleInfo.title}: ${i18n.RTLB.InvalidGameSystem}`)
      .caught()
      .invoke('at', 1)
      .should('contain', `${moduleInfo.title}: ${i18n.RTLB.MainModuleUndefined}`)
  })
  it('Sets Sources', () => {
    cy.login({ world: 'PF2e' })
      .then(module => {
        cy.wrap(module)
          .its('sources')
          .should('not.be.undefined')
      })
  })
  it('Handles Status Changes', done => {
    cy.login({ world: 'PF2e' })
      .then(() => {
        cy.window().its('game').then(game => {
          const mod = game.modules.get(moduleInfo.name).main
          expect(mod.status).to.eq('ready')
          cy.spy(mod, 'render').as('spyRender')
          cy.wrap(mod.setStatus('ready'))
            .then(() => {
              cy.get('@spyRender').should('not.be.called')
              mod._status = 'NOT READY'
            })
            .then(() => {
              cy.wrap(mod.setStatus('ready')).then(() => {
                expect(mod._interface.constructor.name === 'Ready')
                cy.get('@spyRender').should('be.calledOnce')
                  .then(() => {
                    mod.setStatus('BAD STATUS')
                      .then(() => {
                        expect('Should have errored').to.eq('but didn\'t')
                        done()
                      })
                      .catch((error: Error) => {
                        expect(error.message).to.contain(`${moduleInfo.title}: ${i18n.RTLB.InvalidInterfaceStatus}`)
                        done()
                      })
                  })
              })
            })
        })
      })
  })
  it('Notifies Errors', () => {
    cy.login({ world: 'PF2e' })
      .then(() => {
        cy.window().its('ui').its('notifications').then(notifications => {
          cy.spy(notifications, 'error').as('uiNotifyError')
          cy.window().its('game').then(game => {
            const mod = game.modules.get(moduleInfo.name).main
            const err1 = mod.error('RTLB.ModuleNotLoaded')
            expect(err1.message).to.eq(`${moduleInfo.title}: ${i18n.RTLB.ModuleNotLoaded}`)
            cy.get('@uiNotifyError').should('be.calledWith', `${moduleInfo.title}: ${i18n.RTLB.ModuleNotLoaded}`)

            const notLocalized = 'NOT LOCALIZED'
            const err2 = mod.error(notLocalized, false)
            expect(err2.message).to.eq(`${moduleInfo.title}: ${notLocalized}`)
            cy.get('@uiNotifyError').should('be.calledWith', `${moduleInfo.title}: ${notLocalized}`)
          })
        })
      })
  })
})
