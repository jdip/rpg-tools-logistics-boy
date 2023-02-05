import meta from '../../src/module.json'
import i18n from '../../assets/lang/en.json'

describe('main.ts', () => {
  describe('Throws during setup if', () => {
    it('the module isn\'t loaded', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.Error.ModuleNotLoaded}`,
        `${meta.title}: ${i18n.RTLB.Error.ModuleNotSetup}`
      ])
        .login({
          world: 'PF2e',
          onFoundryLoad: () => {
            cy.log('onFoundryLoad 1')
            cy.window().its('game').its('system').then(() => {
              cy.window().its('game').then(game => {
                cy.stub(game.modules, 'get').returns(undefined)
              })
            })
            cy.log('onFoundryLoad 2')
          },
          skipMainReady: true
        })
        .caught()
    })
    it('if game.system.id isn\'t valid during setup', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.Error.InvalidGameSystem}`,
        `${meta.title}: ${i18n.RTLB.Error.ModuleNotSetup}`
      ])
        .login({
          world: 'PF2e',
          onFoundryLoad: () => {
            cy.window().its('game').its('system').then(system => {
              system.id = 'BAD SYSTEM'
            })
          },
          skipMainReady: true
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
          mod.main._status = 'idle'
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
      cy.waitMainReady()
        .then(main => {
          cy.wrap(main)
            .its('sources')
            .should('not.be.undefined')
            .its('constructor.name')
            .should('eq', 'PF2eSources')
        })
    })
    it('setting up tables', () => {
      cy.waitMainReady()
        .then(main => {
          cy.wrap(main)
            .its('tables')
            .should('not.be.undefined')
            .its('constructor.name')
            .should('eq', 'PF2eTables')
        })
    })
    describe('handling status changes', () => {
      it('to initialized', () => {
        cy.waitMainReady()
          .then(main => {
            cy.stub(main.interface, 'render').as('stubRender')
            cy.wrap(main)
              .its('status')
              .should('eq', 'idle')
              .wrap(main)
              .invoke('setStatus', 'initialized')
              .get('@stubRender')
              .should('not.have.been.called')
          })
      })
      it('to idle', () => {
        cy.waitMainReady()
          .then(main => {
            cy.stub(main.interface, 'render').as('stubRender')
            cy.wrap(main)
              .its('status')
              .should('eq', 'idle')
              .wrap(main)
              .invoke('setStatus', 'initialized')
              .get('@stubRender')
              .should('not.have.been.called')
              .wrap(main)
              .invoke('setStatus', 'idle')
              .get('@stubRender')
              .should('not.have.been.called')
          })
      })
      it('to running', () => {
        cy.waitMainReady()
          .then(main => {
            cy.stub(main.interface, 'render').as('stubRender')
            cy.wrap(main)
              .its('status')
              .should('eq', 'idle')
              .wrap(main)
              .invoke('setStatus', 'running')
              .get('@stubRender')
              .should('have.been.calledOnceWith', true)
          })
      })
      it('to canceling', () => {
        cy.waitMainReady()
          .then(main => {
            cy.stub(main.interface, 'render').as('stubRender')
            cy.stub(main.tables, 'cancel').as('stubCancel')
            cy.wrap(main)
              .its('status')
              .should('eq', 'idle')
              .wrap(main)
              .invoke('setStatus', 'canceling')
              .get('@stubRender')
              .should('have.been.calledOnceWith', true)
              .get('@stubCancel')
              .should('have.been.calledOnce')
          })
      })
      it('to aborted', () => {
        cy.waitMainReady()
          .then(main => {
            cy.stub(main.interface, 'render').as('stubRender')
            cy.wrap(main)
              .its('status')
              .should('eq', 'idle')
              .wrap(main)
              .invoke('setStatus', 'aborted')
              .get('@stubRender')
              .should('have.been.calledOnceWith', true)
          })
      })
      it('to complete', () => {
        cy.waitMainReady()
          .then(main => {
            cy.stub(main.interface, 'render').as('stubRender')
            cy.wrap(main)
              .its('status')
              .should('eq', 'idle')
              .wrap(main)
              .invoke('setStatus', 'complete')
              .get('@stubRender')
              .should('have.been.calledOnceWith', true)
          })
      })
      it('to a bad status', done => {
        cy.waitMainReady()
          .then(main => {
            cy.wrap(main.setStatus('idle'))
              .then(() => {
                main.setStatus('initializing')
                  .then(() => {
                    expect('Should have errored').to.eq('but didn\'t')
                    done()
                  })
                  .catch((error: Error) => {
                    expect(error.message).to.contain(`${meta.title}: ${i18n.RTLB.Error.InvalidMainStatus}`)
                    done()
                  })
            })
          })
      })
    })
    describe('handling progress updates by', () => {
      afterEach('reset progress', () => {
        cy.waitMainReady()
          .then(main => {
            main.setProgress([])
          })
      })
      it('setting progress', () => {
        const progress: RTLB.ProgressItem[] = [{ group: 'group', table: 'table', status: 'pending' }]
        cy.waitMainReady()
          .then(main => {
            main.setProgress(progress)
            return cy.wrap(main)
          })
          .its('_progress')
          .should('deep.equal', progress)
      })
      it('updating progress', () => {
        const progress: RTLB.ProgressItem[] = [{ group: 'group', table: 'table', status: 'pending' }]
        const progressResult: RTLB.ProgressItem[] = [{ group: 'group', table: 'table', status: 'running' }]
        cy.waitMainReady()
          .then(main => {
            main.setProgress(progress)
            return cy.wrap(main)
              .its('_progress')
              .should('deep.equal', progress)
              .wrap(main)
          })
          .then(main => {
            return cy.wrap(main.updateProgress(progressResult[0]))
              .wrap(main)
              .its('_progress')
              .should('deep.equal', progressResult)
              .wrap(main)
          })
      })
      it('throwing on invalid progress update', done => {
        const progress: RTLB.ProgressItem[] = [{ group: 'group', table: 'table', status: 'pending' }]
        const progressResult: RTLB.ProgressItem[] = [{ group: 'group', table: 'BAD', status: 'running' }]
        cy.waitMainReady()
          .then(main => {
            main.setProgress(progress)
            return cy.wrap(main)
              .its('_progress')
              .should('deep.equal', progress)
              .wrap(main)
          })
          .then(main => {
            main.updateProgress(progressResult[0])
              .then(() => {
                expect('Shouldn\'t have arrived here').to.eq('but did')
                done()
              })
              .catch(error => {
                expect(error.message).to.contain(`${meta.title}: ${i18n.RTLB.Error.InvalidProgressUpdate}`)
                done()
              })
          })
      })
    })
  })
})
