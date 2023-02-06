import meta from '../../../src/module.json'
import i18n from '../../../assets/lang/en.json'
import { getClickedWidget } from '../../../src/interfaces/helpers'

describe('interfaces/helpers.ts', { testIsolation: false }, () => {
  describe('getClickedWidget', () => {
    it('throws when it can\'t find a button or anchor in target parent chain', () => {
      cy.login({ world: 'PF2e' })
        .window()
        .its('game')
        .then(game => {
          Object.defineProperty(window, 'game', { value: game })
        })
        .window()
        .its('ui')
        .then(ui => {
          Object.defineProperty(window, 'ui', { value: ui })
        })
        .then(() => {
          try {
            // @ts-expect-error: intentionally sending bad event
            getClickedWidget({ target: { parentElement: null } })
            expect('Shouldn\'t have arrived here').to.eq('but did')
          } catch (error) {
            expect(error).instanceof(Error)
            expect((error as Error).message).to.contain(`${meta.title}: ${i18n.RTLB.Error.NoButtonOrAnchorInParentChain}`)
          }
        })
    })
  })
})
