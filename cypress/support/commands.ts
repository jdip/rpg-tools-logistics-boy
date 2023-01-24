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
      //       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
