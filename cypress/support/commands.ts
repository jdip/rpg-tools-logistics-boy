// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="cypress" />
import slugify from 'slugify'

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

const defaultWidth = 1920
const defaultHeight = 1080
const defaultUser = 'Gamemaster'
const defaultAdminPassword = 'asdf1234'

Cypress.Commands.add('login', (options) => {
  const adminPassword = options.adminPassword ?? defaultAdminPassword
  const worldId = slugify(options.world, { lower: true })
  const user = options.user ?? defaultUser
  cy.viewport(options?.viewWidth ?? defaultWidth, options?.viewHeight ?? defaultHeight)
  cy.visit('/auth').then(() => {
    cy.get<HTMLBodyElement>('body').then($body => {
      if ($body[0].classList.contains('auth')) {
        cy.get<HTMLInputElement>('#setup-authentication input[name="adminPassword"]')
          .then($input => {
            $input[0].value = adminPassword
            cy.get('#setup-authentication  button[value="adminAuth"]').click()
          })
      }
    })
    cy.get('body > section').should('be.visible')
      .then($section => {
        if ($section[0].id === 'setup') {
          cy.get<HTMLFormElement>('body > section > form').then($form => {
            if ($form[0].id === 'setup-configuration') {
              cy.get(`button[data-action="launchWorld"][data-world="${worldId}"]`)
                .click()
            }
            cy.get('body > section > form[id="join-game"]').then(() => {
              cy.get<HTMLHeadingElement>('#world-title h1').then($h1 => {
                if ($h1[0].textContent !== options.world) {
                  cy.get<HTMLInputElement>('#join-game input[name="adminPassword"]')
                    .then($input => {
                      $input[0].value = adminPassword
                      cy.get('#join-game  button[name="shutdown"]').click()
                      cy.get(`button[data-action="launchWorld"][data-world="${worldId}"]`)
                        .click()
                    })
                }
                cy.get<HTMLSelectElement>('select[name="userid"]').select(user)
                cy.get<HTMLInputElement>('input[name="password"]').then($input => {
                  $input[0].value = options.password ?? ''
                })
                cy.get<HTMLButtonElement>('button[name="join"]').click()
              })
            })
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.window()
              .then(win => {
                if (options.onLoad !== undefined) options.onLoad(win)
                return cy.wrap(win)
              })
              .its('game')
              .its('ready', { timeout: 15000 }).should('be.true')
              .then(() => {
                console.log('Cypress.login - world loaded:', options.world)
                if (options.onReady !== undefined) options.onReady()
              })
              .wait(250)
          })
        }
      })
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
      login: (options: {
        world: string
        adminPassword?: string
        user?: string
        password?: string
        viewWidth?: number
        viewHeight?: number
        onLoad?: (win: Cypress.AUTWindow) => void
        onReady?: () => void
      }) => Chainable<void>
      console: (message: string) => Chainable<void>
      //       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
