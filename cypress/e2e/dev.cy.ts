const viewWidth = 1920
const viewHeight = 1080

beforeEach('Login to Game World', () => {
  cy.viewport(viewWidth, viewHeight)
  cy.visit('/')
  cy.get('select').select('Gamemaster')
  cy.get('button[name=join]').click()
  cy.window().its('game').its('ready').should('be.true').then(result => {
    console.log(result, 'game ready')
  })
  cy.window().its('game').wait(250).then(() => {
    console.log('CYPRESS: Foundry Loaded, beginning tests')
  })
})

describe('Build Interface', () => {
  beforeEach('Open App', () => {
    cy.get('a[data-tab=tables]').click()
    cy.get('button[id=rt-log-boy-open-app]').click()
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
