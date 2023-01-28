import { RTLBConfigSources } from '../../../src/interfaces/config-sources'
import { registerSettings } from '../../../src/config/settings'

interface mock {
  settingsRegistered: boolean
}
describe('settings/sources', () => {
  it('calls all registration functions', () => {
    cy.stub(RTLBConfigSources, 'registerSettings').returns({ settingsRegistered: true })
    cy.wrap(registerSettings()).then(result => {
      expect((result as mock).settingsRegistered).to.be.true
    })
  })
})
