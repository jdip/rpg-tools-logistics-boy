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
import meta from '../../src/module.json'
import { recurse } from 'cypress-recurse'

interface LoginParams {
  world: string
  worldId?: string
  adminPassword?: string
  user?: string
  password?: string
  viewWidth?: number
  viewHeight?: number
  onFoundryLoad?: () => void // run early in foundry loading process
  onFoundryReady?: () => void // run once game.ready === true
  skipModuleReady?: boolean
  onModuleReady?: () => void
}

type ProcessParams = LoginParams & {
  worldId: string
}

const defaultWidth = 1920
const defaultHeight = 1080
const defaultUser = 'Gamemaster'
const defaultAdminPassword = 'asdf1234'
const defaultUserPassword = ''
let sessionCookie: Cypress.Cookie

Cypress.Commands.add('waitModuleReady', (): Chainable<RTLB.ThisModule> => {
  return cy.window()
    .its('game')
    .its('modules')
    .then(modules => {
      const mod = modules.get(meta.name)
      return cy.wrap(mod.main)
        .its('status')
        .should('eq', 'ready')
        .then(() => {
          return cy.wrap(mod.main)
        })
    })
})

const processPage = (params: ProcessParams, $body: JQuery<HTMLBodyElement>): Chainable<RTLB.ThisModule | undefined> => {
  if ($body[0].classList.contains('auth')) {
    // Need to authenticate as admin
    return cy.get<HTMLInputElement>('#setup-authentication input[name="adminPassword"]')
      .then($input => {
        $input[0].value = params.adminPassword ?? defaultAdminPassword
        cy.get('#setup-authentication  button[value="adminAuth"]')
          .click()
        return cy.get<HTMLBodyElement>('body')
          .then($b => {
            return processPage(params, $b)
          })
      })
  } else if ($body[0].classList.contains('setup')) {
    // Need to Launch World
    cy.get(`button[data-action="launchWorld"][data-world="${params.worldId}"]`)
      .click()
    return cy.get<HTMLBodyElement>('body.players')
      .then($b => {
        return processPage(params, $b)
      })
  } else if ($body[0].classList.contains('players')) {
    // Need to join game, or go back to setup
    return cy.window()
      .its('game')
      .its('world', { timeout: 10000 })
      .its<string>('title')
      .then(title => {
        if (title === params.world) {
          // Join game
          cy.get<HTMLSelectElement>('select[name="userid"]')
            .select(params.user ?? defaultUser)
            .get<HTMLInputElement>('input[name="password"]')
            .then($input => {
              $input[0].value = params.password ?? defaultUserPassword
            })
            .get<HTMLButtonElement>('button[name="join"]')
            .click()
          return cy.get<HTMLBodyElement>('body.game')
            .then($b => {
              return processPage(params, $b)
            })
        } else {
          // Go back to setup
          return cy.get('form[id=join-game]').then(() => {
            if ($body.find('#join-game input[name="adminPassword"]').length === 0) {
              // Already authenticated as an admin
              cy.get('#join-game  button[name="shutdown"]').click()
              return cy.get<HTMLBodyElement>('body.setup')
                .then($b => {
                  return processPage(params, $b)
                })
            } else {
              // Not authenticated as an admin
              return cy.get<HTMLInputElement>('#join-game input[name="adminPassword"]')
                .then($input => {
                  $input[0].value = params.adminPassword ?? defaultAdminPassword
                  cy.get('#join-game  button[name="shutdown"]').click()
                  return cy.get<HTMLBodyElement>('body.setup')
                    .then($b => {
                      return processPage(params, $b)
                    })
                })
            }
          })
        }
      })
  } else if ($body[0].classList.contains('game')) {
    if ($body.find('#error').find(':contains("No Active Game")').length === 1) {
      // No world is loaded, back to setup
      return cy.visit('/setup')
        .get<HTMLBodyElement>('body')
        .then($b => {
          return processPage(params, $b)
        })
    } else {
      // There is a world loaded
      return cy.window()
        .its('game')
        .its('world', { timeout: 10000 })
        .its<string>('title')
        .then(title => {
          if (title === params.world) {
            // The loaded world is the right one
            return cy.wait('@visitedGame')
              .getCookies()
              .should('have.length', 1)
              .then(cookies => {
                expect(cookies[0]).to.have.property('name', 'session')
                sessionCookie = cookies[0]
              })
              .window()
              .then(win => {
                params.onFoundryLoad?.()
                return cy.wrap(win)
              })
              .its('game')
              .its('ready', { timeout: 10000 })
              .should('be.true')
              .then(() => {
                params.onFoundryReady?.()
                return params.skipModuleReady === true
                  ? undefined
                  : cy.waitModuleReady()
                    .then((module: RTLB.ThisModule) => {
                      params.onModuleReady?.()
                      return cy.wrap(module)
                    })
              })
          } else {
            // the loaded world is the wrong one, logout of it
            cy.get('#sidebar-tabs a[data-tab="settings"]')
              .click()
              .get('#settings-access button[data-action="logout"]').click()
            return cy.get<HTMLBodyElement>('body.players')
              .then($b => {
                return processPage(params, $b)
              })
          }
        })
    }
  }
}
Cypress.Commands.add('login', (params) => {
  params.worldId = params.worldId ?? slugify(params.world, { lower: true })
  cy.viewport(params?.viewWidth ?? defaultWidth, params?.viewHeight ?? defaultHeight)
  cy.intercept('/game').as('visitedGame')
  if (sessionCookie !== undefined) {
    cy.setCookie(sessionCookie.name, sessionCookie.value)
  }
  return cy.visit('/game').then(() => {
    return cy.get<HTMLBodyElement>('body').then($body => {
      return processPage((params as ProcessParams), $body)
    })
  })
})

let expectedErrors: string[] = []
let totalExpectedErrors = 0
let caught: string[] = []
Cypress.Commands.add('try', (exceptions: string[]) => {
  expect(exceptions.length).to.be.gt(0)
  expectedErrors = [...exceptions]
  totalExpectedErrors = expectedErrors.length
  caught = []
  cy.on('uncaught:exception', error => {
    const expectedError = expectedErrors.shift()
    if (expectedError !== undefined && error.message.includes(expectedError)) {
      caught.push(expectedError)
      return false
    }
    return true
  })
  return cy.wrap(caught)
})

Cypress.Commands.add('caught', () => {
  cy.wrap(caught)
    .should('have.length', totalExpectedErrors)
    .wrap(expectedErrors)
    .should('have.length', 0)
  return cy.wrap(caught)
})

Cypress.Commands.add('closeFoundryApp', (id: string) => {
  return cy.get('body')
    .then($body => {
      recurse(
        () => {
          const $a = $body.find(`#${id} > header > a.close`)?.[0]
          if ($a !== undefined) {
            $a.click()
            return cy.wrap($a)
          }
          return cy.wrap<JQuery<HTMLElement>>($body)
        },
        html => html.prop('tagName') === 'BODY',
        {
          delay: 50
        }
      )
    })
})

Cypress.Commands.add('clickSidebarButton', (tab: string, action: string): Chainable<JQuery<HTMLButtonElement>> => {
  return cy.get(`nav[id=sidebar-tabs] a[data-tab="${tab}"]`)
    .click()
    .get(`div[id=sidebar] section[id="${tab}"] button[data-action="${action}"]`)
    .click()
})

Cypress.Commands.add('openConfigMenu', (tab: string, key: string): Chainable<JQuery<HTMLButtonElement>> => {
  return cy.clickSidebarButton('settings', 'configure')
    .get(`div[id=client-settings] a[data-tab="${tab}"]`)
    .click()
    .get(`div[id=client-settings] button[data-key="${key}"]`)
    .click()
})

Cypress.Commands.add('arrayDiff', (arrA: any[], arrB: any[]): Chainable<any[]> => {
  return cy.wrap(
    arrA
      .filter(x => !arrB.includes(x))
      .concat(arrB.filter(x => !arrA.includes(x)))
  )
})
Cypress.Commands.add('console', (message: string) => {
  console.log(message)
})

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, params) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, params) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, params) => { ... })
//
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    export interface Chainable {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      login: (params: LoginParams) => Chainable<RTLB.ThisModule | undefined>
      waitModuleReady: () => Chainable<RTLB.ThisModule>
      try: (exceptions: string[]) => Chainable<string[]>
      caught: () => Chainable<string[]>
      closeFoundryApp: (id: string) => Chainable<JQuery<HTMLBodyElement>>
      clickSidebarButton: (tab: string, action: string) => Chainable<JQuery<HTMLButtonElement>>
      openConfigMenu: (tab: string, key: string) => Chainable<JQuery<HTMLButtonElement>>
      arrayDiff: (arrA: any[], arrB: any[]) => Chainable<any[]>
      console: (message: string) => Chainable<void>
      //       drag(subject: string, params?: Partial<Typeparams>): Chainable<Element>
      //       dismiss(subject: string, params?: Partial<Typeparams>): Chainable<Element>
      //       visit(originalFn: CommandOriginalFn, url: string, params: Partial<Visitparams>): Chainable<Element>
    }
  }
}
