import moduleInfo from '../../../src/module.json'
import { getUniqueItemSources } from '../../../src/config/sources'

const isArrayOfString = (obj: unknown): obj is string[] => {
  if (!Array.isArray(obj)) return false
  for (let i = 0; i < obj.length; i = i + 1) {
    if (typeof obj[i] !== 'string') return false
  }
  return true
}
describe('config/sources - unit', () => {
  it('Throws/notifies when it can\'t get the equipment compendium', (done) => {
    Object.defineProperty(globalThis, 'game', {
      configurable: true,
      value: {
        packs: new Map()
      }
    })
    let message = ''
    Object.defineProperty(globalThis, 'ui', {
      configurable: true,
      value: {
        notifications: {
          error: (m: string) => { message = m }
        }
      }
    })

    getUniqueItemSources()
      .then(() => {
        throw new Error('expected exception never thrown')
      })
      .catch(err => {
        expect(err.message).to.contain(`${moduleInfo.title}: equipment compendium does not appear to be initialized.`)
        expect(message).to.eq(`${moduleInfo.title}: equipment compendium does not appear to be initialized.`)
        done()
      })
  })
})
describe('config/sources - e2e', () => {
  beforeEach('Login', () => {
    cy.login()
  })
  it('gathers available sources', () => {
    cy.window().its('game').then(game => {
      Object.defineProperty(globalThis, 'game', {
        configurable: true,
        value: game
      })
      cy.wrap(getUniqueItemSources()).then(sources => {
        expect(isArrayOfString(sources)).to.be.true
        cy.fixture('sources').then(fixture => {
          expect(sources).to.deep.eq(fixture)
        })
        cy.fixture('defaultSources').then(defaultSources => {
          cy.wrap(defaultSources).each((pack: string) => {
            expect((sources as string[]).includes(pack)).to.be.true
          })
        })
      })
    })
  })
})
