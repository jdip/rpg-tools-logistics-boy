import meta from '../../../src/module.json'
import i18n from '../../../assets/lang/en.json'
import { createTables } from '../../../src/tables'

const openWithTables = (tables: Array<[string, string]>): Cypress.Chainable => {
  return cy.waitMainReady()
    .then(mod => {
      return cy.wrap(mod.setStatus('running', tables))
    })
    .clickSidebarButton('tables', `${meta.name}-open-interface`)
    .end()
}

const getTables = (mod: RTLB.Main): Array<[string, string]> => {
  const defs = createTables(mod).definitions
  const tables = []
  for (const groupName of (Object.keys(defs))) {
    const group = defs[groupName]
    for (const tableName of (Object.keys(group))) {
      tables.push([groupName, tableName] as [string, string])
    }
  }
  return tables
}
describe('interfaces/ready.ts', { testIsolation: false }, () => {
  before('Load Foundry', () => {
    cy.login({ world: 'PF2e' })
  })
  beforeEach('open interface', () => {
    // cy.clickSidebarButton('tables', `${meta.name}-open-interface`)
  })
  afterEach('reset status', () => {
    cy.getMain()
      .then(main => {
        // @ts-expect-error: setting private property
        main._status = 'ready'
      })
  })
  afterEach('close interface', () => {
    // cy.closeFoundryApp(`${meta.name}-ready-interface`)
    // cy.closeFoundryApp(`${meta.name}-running-interface`)
  })
  describe('Throws when', () => {
    it('tables list is empty', done => {
      cy.waitMainReady()
        .then(main => {
          main.setStatus('running', [])
          .then(() => {
            expect('Shouldn\'t gave gotten here').to.eq('but did')
            done()
          })
          .catch(err => {
            expect(err.message).to.contain(`${meta.title}: ${i18n.RTLB.Error.InvalidTablesSelected}`)
            done()
          })
        })
    })
    it('tables list has invalid group', done => {
      cy.waitMainReady()
        .then(main => {
          main.setStatus('running', [['INVALID', 'all']])
            .then(() => {
              expect('Shouldn\'t gave gotten here').to.eq('but did')
              done()
            })
            .catch(err => {
              expect(err.message).to.contain(`${meta.title}: ${i18n.RTLB.Error.InvalidTablesSelected}`)
              done()
            })
        })
    })
    it('tables list has invalid table', done => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          main.setStatus('running', [[Object.keys(defs)[0], 'INVALID']])
            .then(() => {
              expect('Shouldn\'t gave gotten here').to.eq('but did')
              done()
            })
            .catch(err => {
              expect(err.message).to.contain(`${meta.title}: ${i18n.RTLB.Error.InvalidTablesSelected}`)
              done()
            })
        })
    })
  })
  describe('Renders correctly by', () => {
    it('displaying styles', () => {
      openWithTables([['Alchemist', 'all']])
        .get(`#${meta.name}-running-content header`)
        .should('have.css', 'background-color', 'rgb(0, 0, 0)')
    })
    it('listing tables', () => {
      cy.waitMainReady()
        .then(main => {
          const tables = getTables(main)
          openWithTables(tables)
            .get(`#${meta.name}-running-content header`)
            .should('have.css', 'background-color', 'rgb(0, 0, 0)')
        })
    })
  })
  describe('Behaves correctly by', () => {
    it.skip('checking & showing all when select-all is clicked', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.get(`#${meta.name}-ready-content a[data-action="select-all"]`)
            .click()
            .wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              const subgroup = defs[key]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  cy.get(`#${meta.name}-ready-content input[value="${key}.${sKey}"]`)
                    .should('be.checked')
                    .should('be.visible')
                })
            })
        })
    })
  })
})
