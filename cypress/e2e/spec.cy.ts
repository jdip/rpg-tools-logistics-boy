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
  afterEach('Close App', () => {
    cy.window().its('game').then(result => {
      console.log(result.modules.get('rpg-tools-logistics-boy').buildInterface.close())
    })
    cy.get('#rpg-tools-logistics-boy-build-interface').should('not.exist')
  })
  it('Open app', () => {
    cy.get('section[id=rt-log-boy-app] > main').then($items => {
      expect($items).to.contain('Creating Loot Rollable Tables')
    })
    cy.get('button[data-action=create-rollable-tables]').click()
  })
})

export {}
