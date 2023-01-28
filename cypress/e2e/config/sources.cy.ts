import { getUniqueItemSources } from '../../instrumented/config/sources'

describe('settings/sources', () => {
  beforeEach('Login', () => {
  })
  it('Throws when it can\'t get the equipment compendium', (done) => {
    Object.defineProperty(globalThis, 'game', {
      configurable: true,
      value: {
        packs: new Map()
      }
    })
    Object.defineProperty(globalThis, 'ui', {
      configurable: true,
      value: {
        notifications: {
          error: () => {}
        }
      }
    })

    getUniqueItemSources()
      .then(() => {
        throw new Error('expected exception never thrown')
      })
      .catch(err => {
        expect(err.message).to.contain('LogisticsBoy: equipment compendium does not appear to be initialized.')
        done()
        // expect(globalThis.ui.notifications.error).to.be.calledOnceWith('LogisticsBoy: equipment compendium does not appear to be initialized.')
      })
    /* cy.login().then(() => {
      Object.defineProperty(globalThis, 'game', {
        configurable: true,
        value: { packs: new Map() }
      })
      cy.spy(ui.notifications, 'error')
      cy.window().then(win => {
        console.log(win)
      })
      cy.window().its('game').then(game => {
        console.log('GAME', game)
      })
      getUniqueItemSources()
        .then(() => {
          throw new Error('expected exception never thrown')
        })
        .catch(err => {
          cy.window().then(win => {
            console.log('WINDOW', win)
          })
          expect(ui.notifications.error).to.be.calledOnceWith('LogisticsBoy: equipment compendium does not appear to be initialized.')
          expect(err.message).to.contain('LogisticsBoy: equipment compendium does not appear to be initialized.')
          done()
        })
    }) */
  })
  /* it('Retrieves available equipment sources', () => {
    cy.login().then(() => {
      cy.wrap(getUniqueItemSources()).then(itemSources => {
        expect(itemSources).is.a('array')
        cy.fixture('sources').then(sources => {
          expect((itemSources as unknown[]).length).to.eq(sources.length)
          const diff = Cypress._.difference(sources, (itemSources as unknown[]))
          expect(diff).to.be.empty
        })
      })
    })
  }) */
})
