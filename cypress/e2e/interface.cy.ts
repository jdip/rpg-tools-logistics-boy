const viewWidth = 1920
const viewHeight = 1080

beforeEach('Login to Game World', () => {
  cy.viewport(viewWidth, viewHeight)
  cy.visit('/')
  cy.get('select').select('Gamemaster')
  cy.get('button[name=join]').click()
  cy.window().its('game').its('ready', { timeout: 15000 }).should('be.true').then(result => {
    console.log(result, 'game ready')
  })
  cy.window().its('game').wait(250).then(() => {
    console.log('CYPRESS: Foundry Loaded, beginning tests')
  })
})

describe('Build Interface', () => {
  beforeEach('Open App', () => {
    cy.get('nav[id=sidebar-tabs] a[data-tab=settings]').click()
    cy.get('div[id=sidebar] section[id=settings] button[data-action=configure]').click()
    cy.get('div[id=client-settings] a[data-tab=rpg-tools-logistics-boy]').click()
    cy.get('div[id=client-settings] button[data-key="rpg-tools-logistics-boy.sourceMenu"]').click()
  })
  it('Open app', () => {
    cy.window().its('ui').then(($ui) => {
      $ui.notifications?.info(
        'Test'
      )
    })
  })
})

export {}
