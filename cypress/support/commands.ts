// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

// @ts-expect-error: it actually is used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Chainable } from 'Cypress'

// -- This is a parent command --
Cypress.Commands.add('login', (viewWidth: number = 1920, viewHeight: number = 1080) => {
  cy.viewport(viewWidth, viewHeight)
  cy.visit('/')
  cy.get('select').select('Gamemaster')
  cy.get('button[name=join]').click()
  cy.window().its('game').its('ready', { timeout: 15000 }).should('be.true').then(result => {
    console.log(result, 'game ready')
  })
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.window().its('game').wait(250).then(() => {
    console.log('CYPRESS: Foundry Loaded, beginning tests')
  })
  cy.window().its('game').then(game => {
    Object.defineProperty(globalThis, 'game', { configurable: true, value: game })
  })
  cy.window().its('ui').then(ui => {
    Object.defineProperty(globalThis, 'ui', { configurable: true, value: ui })
  })
})
Cypress.Commands.add('console', (message: string) => {
  console.log(message)
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    export interface Chainable {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      console(message: string): Chainable<void>
      login: () => Chainable<void>
      //       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
