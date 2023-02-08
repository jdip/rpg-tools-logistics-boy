import meta from '../../../src/module.json'
import i18n from '../../../assets/lang/en.json'
import { createTables } from '../../../src/tables'

describe('interfaces/main.ts', { testIsolation: false }, () => {
  before('Load Foundry', () => {
    cy.login({ world: 'PF2e' })
  })
  beforeEach('open interface', () => {
    cy.clickSidebarButton('tables', 'rtlb-open-interface')
  })
  afterEach('close interface', () => {
    // cy.closeFoundryApp(`rtlb-main-interface`)
  })
  describe('Renders correctly by', () => {
    it('displaying styles', () => {
      cy.get('#rtlb-main-content header')
        .should('have.css', 'background-color', 'rgb(0, 0, 0)')
    })
    it('lists & checks default groups', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              cy.get(`#rtlb-main-content input[value="${key}.all"]`)
                .should('be.checked')
                .should('be.visible')
            })
        })
    })
    it('lists but hides unchecked sub-groups', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              const subgroup = defs[key]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey !== 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('not.be.visible')
                  }
                })
            })
        })
    })
  })
  describe('Behaves correctly by', () => {
    it('checking & showing all when select-all is clicked', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.get('#rtlb-main-content a[data-action="select-all"]')
            .click()
            .wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              const subgroup = defs[key]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                    .should('be.checked')
                    .should('be.visible')
                })
            })
        })
    })
    it('checking & showing defaults when select-default is clicked', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.get('#rtlb-main-content a[data-action="select-all"]')
            .click()
          cy.get('#rtlb-main-content a[data-action="select-default"]')
            .click()
            .wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              const subgroup = defs[key]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey === 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('be.checked')
                      .should('be.visible')
                  } else {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('not.be.visible')
                  }
                })
            })
        })
    })
    it('checking & showing none when select-none is clicked', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.get('#rtlb-main-content a[data-action="select-all"]')
            .click()
          cy.get('#rtlb-main-content a[data-action="select-none"]')
            .click()
            .wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              const subgroup = defs[key]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey === 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('be.visible')
                  } else {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('not.be.visible')
                  }
                })
            })
        })
    })
    it('enabling/disabling Create Tables button when tables are selected/not selected', () => {
      cy.get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
        .get('#rtlb-main-content a[data-action="select-default"]')
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
        .get('#rtlb-main-content a[data-action="select-none"]')
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('be.disabled')
        .get('#rtlb-main-content a[data-action="select-default"]')
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
    })
    it('enabling/disabling Create Tables button when individual checkbox is clicked', () => {
      cy.get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
        .get('#rtlb-main-content a[data-action="select-none"]')
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('be.disabled')
        .get('#rtlb-main-content input[type="checkbox"]')
        .first()
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
        .get('#rtlb-main-content input[type="checkbox"]')
        .first()
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('be.disabled')
    })
    it('expanding/hiding group when drop-details anchor is clicked', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.wrap(Object.keys(defs))
            .each((key: keyof typeof defs & string) => {
              const subgroup = defs[key]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey === 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('be.checked')
                      .should('be.visible')
                  } else {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('not.be.visible')
                  }
                })
              cy.get(`#rtlb-main-content a[data-group=${key}]`)
                .click()
                .wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey === 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('be.checked')
                      .should('be.visible')
                  } else {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('be.visible')
                  }
                })
              cy.get(`#rtlb-main-content a[data-group=${key}]`)
                .click()
                .wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey === 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('be.checked')
                      .should('be.visible')
                  } else {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('not.be.visible')
                  }
                })
            })
        })
    })
    it('throwing when _dropDetails can\'t get  data-group', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          cy.try([`${meta.title}: ${i18n.RTLB.Error.NoDataGroup}`])
            .wrap(Object.keys(defs)[0])
            .then((key: string) => {
              const subgroup = defs[(key)]
              cy.wrap(Object.keys(subgroup))
                .each((sKey: keyof typeof subgroup & string) => {
                  if (sKey === 'all') {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('be.checked')
                      .should('be.visible')
                  } else {
                    cy.get(`#rtlb-main-content input[value="${key}.${sKey}"]`)
                      .should('not.be.checked')
                      .should('not.be.visible')
                  }
                })
              cy.get<HTMLAnchorElement>(`#rtlb-main-content a[data-group=${key}]`)
                .then($a => {
                  $a.removeData('group')
                  $a.removeAttr('data-group')
                  return cy.wrap($a)
                })
                .click()
            })
            .caught()
        })
    })
    it('calls main.setStatus with correct args when Create Tables is clicked (all)', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          const resultingTables: Array<[string, string]> = []
          for (const [key, value] of Object.entries(defs)) {
            resultingTables.push([key, 'all'])
            for (const subKey of Object.keys(value)) {
              if (subKey !== 'all') resultingTables.push([key, subKey])
            }
          }
          cy.stub(main, 'setStatus').as('stubbedSetStatus')
          cy.get('#rtlb-main-content a[data-action="select-all"]')
            .click()
            .get('#rtlb-main-content button[data-action="create-tables"]')
            .should('not.be.disabled')
            .click()
            .get('@stubbedSetStatus')
            .should('be.calledOnceWith', 'running', resultingTables)
        })
    })
    it('calls main.setStatus with correct args when Create Tables is clicked (single)', () => {
      cy.waitMainReady()
        .then(main => {
          const defs = createTables(main).definitions
          const resultingTables: Array<[string, string]> = [
            [Object.keys(defs)[0], 'all']
          ]
          cy.stub(main, 'setStatus').as('stubbedSetStatus')
          cy.get('#rtlb-main-content a[data-action="select-none"]')
            .click()
            .get('#rtlb-main-content input[type="checkbox"]')
            .first()
            .click()
            .get('#rtlb-main-content button[data-action="create-tables"]')
            .should('not.be.disabled')
            .click()
            .get('@stubbedSetStatus')
            .should('be.calledOnceWith', 'running', resultingTables)
        })
    })
    it.only('displays running interface after Create Tables is clicked (single)', () => {
      cy.get('#rtlb-main-content a[data-action="select-none"]')
        .click()
        .get('#rtlb-main-content a[data-group="Weaponsmith"]')
        .click()
        .get('#rtlb-main-content ul.rtlb-details-list.rtlb-Weaponsmith input[type="checkbox"]')
        .click({ multiple: true })
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
        .click()
    })
    it('displays running interface after Create Tables is clicked (single)', () => {
      cy.get('#rtlb-main-content a[data-action="select-all"]')
        .click()
        .get('#rtlb-main-content button[data-action="create-tables"]')
        .should('not.be.disabled')
        .click()
        .end()
        .get('#rtlb-main-content ul.rtlb-progress-list li[data-status="done"]:contains("Wands")', { timeout: 10000 })
        .get('#rtlb-main-content button[data-action="cancel"]')
        .click({ force: true })
        .then(arcanist => {
          console.log('Clicked', arcanist)
        })
    })
  })
})
