
const VIEWPORT_WIDTH = 1024
const VIEWPORT_HEIGHT = 700


describe('template spec', () => {
  it('passes', () => {
    cy.viewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
    cy.visit('http://localhost:30001')
    cy.get('select').select('Gamemaster')
    cy.get('button[name=join]').click()
    cy.get('a[data-tab=actors]').click()
    cy.get('button.cc-sidebar-button').click()
    cy.intercept('GET',"https://dog.ceo/api/breeds/image/random").as("getDog")
    cy.get('button.module-control').click()
    cy.wait('@getDog')
    cy.get('button.module-control').click('topLeft')
    cy.wait('@getDog')
  })
})