import i18n from '../../../../assets/lang/en.json'

import { itemSources } from '../../../../src/config/pf2e-sources'

const isArrayOfString = (obj: unknown): obj is string[] => {
  if (!Array.isArray(obj)) return false
  for (let i = 0; i < obj.length; i = i + 1) {
    if (typeof obj[i] !== 'string') return false
  }
  return true
}

describe('config/pf2e-sources - e2e', () => {
  it('Throws/notifies when it can\'t get the equipment compendium', () => {
    cy.on('uncaught:exception', error => {
        return !error.message.includes(i18n['RTLB.EquipmentCompendiumNotInitialized'])
    })
    cy.login({
      world: 'PF2e',
      onLoad: (win) => {
        cy.wrap(win).its('game').its('system').then(() => {
          cy.spy(win.console, 'error').as('spyWinConsoleError')
          cy.spy(win.console, 'log').as('spyWinConsoleLog')
        })
        cy.get('@spyWinConsoleLog')
          .should('be.calledWith', 'Foundry VTT | Rendering CompendiumDirectoryPF2e')
          .then(() => {
            cy.wrap(win).its('game').then(game => {
              cy.stub(game.packs, 'get', () => undefined)
            })
          })
      }
    })
  })
  it('gathers available sources', () => {
    cy.login({ world: 'PF2e' })
    cy.window().its('game').then(game => {
      cy.get('script[src="modules/rpg-tools-logistics-boy/scripts/rpg-tools-logistics-boy.js"]').then(script => {
        console.log('SCRIPT', script)
      })
      Object.defineProperty(globalThis, 'game', {
        configurable: true,
        value: game
      })
      cy.wrap(itemSources).then(sources => {
        console.log(sources)
        expect(isArrayOfString(sources)).to.be.true
        cy.fixture('sources').then(fixture => {
          expect(sources).to.deep.eq(fixture)
        })
        cy.fixture('defaultSources').then(defaultSources => {
          cy.wrap(defaultSources).each((pack: string) => {
            expect(sources.includes(pack)).to.be.true
          })
        })
      })
    })
  })
})
