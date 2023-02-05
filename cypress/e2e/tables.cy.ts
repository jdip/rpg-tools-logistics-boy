import meta from '../../src/module.json'
import i18n from '../../assets/lang/en.json'
import { isPathfinderItemArray } from '../../src/helpers'

const cleanup = (done: Mocha.Done): Cypress.Chainable<void> => {
  return cy.window()
    .its('game')
    .then(game => {
      const folder = game.folders.getName('LogisticsBoy')
      const tableCollection = (game.collections.get('RollTable') as RollTables)
      const tables = tableCollection.filter((t: RollTable) => t.folder === folder);
      (async () => {
        for (const table of tables) {
          await table.delete()
        }
      })()
        .then(() => {
          folder?.delete()
          done()
        })
        .catch((error: Error) => {
          done()
          throw error
        })
    })
}

const checkItemWeight = (table: RollTable, name: string, weight: number): void => {
  const itemToCheck = [...table.results.values()].find((item) => {
    const itemName = (item as TableResult).text
    return itemName === name
  }) as TableResult | undefined
  expect(itemToCheck).to.not.be.undefined
  expect(itemToCheck?.weight).to.eq(weight)
}

const getTable = (game: Game, name: string): RollTable => {
  const folder = game.folders.getName('LogisticsBoy')
  const tableCollection = (game.collections.get('RollTable') as RollTables)
  const table = tableCollection.find((t: RollTable) => t.folder === folder && t.name === name)
  expect(table).to.not.be.undefined
  return table as RollTable
}

const getItems = async (main: RTLB.Main): Promise<PathfinderItem[]> => {
  const items = await main.sources.getItems()
  if (typeof items === 'object' && items !== null && isPathfinderItemArray(items)) {
    return items
  }
  throw new Error('Couldn\'t get items')
}

describe('tables.ts', { testIsolation: false }, () => {
  before('Login', done => {
    cy.login({ world: 'PF2e' })
      .then(() => {
        cleanup(done)
      })
  })
  afterEach('Delete tables & folder', done => {
    cleanup(done)
  })
  describe('Throws if', () => {
    it('getFolder can\'t find or create folder', done => {
      cy.waitMainReady()
        .then(main => {
          cy.window()
            .its('CONFIG')
            .its('Folder')
            .its('documentClass')
            .then(Folder => {
              cy.stub(Folder, 'create').returns(undefined)
            })
            .window()
            .its('game')
            .its('folders')
            .then(folders => {
              cy.stub(folders, 'get').returns(undefined)
            })
            .then(() => {
              cy.tryAsync(
                main.tables.getFolder(),
                `${meta.title}: ${i18n.RTLB.Error.CouldNotFindOrCreateFolder}`,
                done
              )
            })
        })
    })
    describe('build is passed', () => {
      it('a bad group', done => {
        cy.waitMainReady()
          .then(main => {
            cy.tryAsync(
              main.tables.build('BAD GROUP', 'BAD TABLE', []),
              `${meta.title}: ${i18n.RTLB.Error.InvalidTableGroup}`,
              done
            )
          })
      })
      it('a bad table', done => {
        cy.waitMainReady()
          .then(main => {
            cy.tryAsync(
              main.tables.build('Alchemist', 'BAD TABLE', []),
              `${meta.title}: ${i18n.RTLB.Error.InvalidTable}`,
              done
            )
          })
      })
      it('a bad item list', done => {
        cy.waitMainReady()
          .then(main => {
            cy.tryAsync(
              main.tables.build('Alchemist', 'potion', ['BAD ITEM']),
              `${meta.title}: ${i18n.RTLB.Error.InvalidItemList}`,
              done
            )
          })
      })
    })
    it('build can\'t find or create a table', done => {
      cy.waitMainReady()
        .then(main => {
          cy.window()
            .its('CONFIG')
            .its('RollTable')
            .its('documentClass')
            .then(RollTable => {
              cy.stub(RollTable, 'create').returns(undefined)
            })
            .then(() => {
              cy.tryAsync(
                main.tables.build('Alchemist', 'potion', []),
                `${meta.title}: ${i18n.RTLB.Error.CouldNotFindOrCreateTable}`,
                done
              )
            })
        })
    })
  })
  describe('Behaves correctly by', () => {
    it('Creating a roll table', () => {
      cy.waitMainReady()
        .then(main => {
          return cy.wrap(getItems(main))
            .then(items => {
              return cy.wrap(main.tables.build('Alchemist', 'potion', items as unknown[]))
                .window()
                .its('game')
                .then(game => {
                  const table = getTable(game, 'Alchemist - potion')
                  expect(table).to.not.be.undefined
                  checkItemWeight(table, 'Healing Potion (Minor)', 80000)
                  checkItemWeight(table, 'Potion of Cold Retaliation (Minor)', 40000)
                })
            })
        })
    })
    it('Recreating an existing roll table', () => {
      cy.waitMainReady()
        .then(main => {
          let firstSize = 0
          cy.wrap(getItems(main))
            .then(items => {
              cy.wrap(main.tables.build('Alchemist', 'potion', items as unknown[]))
                .window()
                .its('game')
                .then(game => {
                  const table = getTable(game, 'Alchemist - potion')
                  expect(table).to.not.be.undefined
                  checkItemWeight(table, 'Healing Potion (Minor)', 80000)
                  checkItemWeight(table, 'Potion of Cold Retaliation (Minor)', 40000)
                  checkItemWeight(table, 'Invisibility Potion', 1445)
                  const tableResults = [...table.results.values()]
                  firstSize = tableResults.length
                  expect(firstSize).to.eq(114)
                })
                .wrap(items)
            })
            .then(items => {
              cy.wrap(main.tables.build('Alchemist', 'potion', items as unknown[]))
                .window()
                .its('game')
                .then(game => {
                  const table = getTable(game, 'Alchemist - potion')
                  expect(table).to.not.be.undefined
                  checkItemWeight(table, 'Healing Potion (Minor)', 80000)
                  checkItemWeight(table, 'Potion of Cold Retaliation (Minor)', 40000)
                  checkItemWeight(table, 'Invisibility Potion', 1445)
                  const tableResults = [...table.results.values()]
                  expect(tableResults.length).to.eq(firstSize)
                })
            })
        })
    })
    it('handling an item without a rarity', () => {
      cy.waitMainReady()
        .then(main => {
          cy.wrap(getItems(main))
            .then(items => {
              const filteredItems = (items as PathfinderItem[]).filter(item => item.name === 'Invisibility Potion')
              if (filteredItems[0].system.traits?.rarity === undefined) throw new Error('Rarity Undefined')
              filteredItems[0].system.traits.rarity = undefined
              cy.wrap(main.tables.build('Alchemist', 'potion', filteredItems as unknown[]))
                .window()
                .its('game')
                .then(game => {
                  const table = getTable(game, 'Alchemist - potion')
                  expect(table).to.not.be.undefined
                  checkItemWeight(table, 'Invisibility Potion', 28900)
                  const tableResults = [...table.results.values()]
                  expect(tableResults.length).to.eq(1)
                  if (filteredItems[0].system.traits === undefined) throw new Error('Rarity Undefined')
                  filteredItems[0].system.traits.rarity = 'uncommon'
                })
            })
        })
    })
    it('handling an item with a rarity factor of zero', () => {
      cy.waitMainReady()
        .then(main => {
          cy.wrap(getItems(main))
            .then(items => {
              const filteredItems = (items as PathfinderItem[]).filter(item => item.name === 'Invisibility Potion')
              if (filteredItems[0].system.traits?.rarity === undefined) throw new Error('Rarity Undefined')
              filteredItems[0].system.traits.rarity = 'unique'
              cy.wrap(main.tables.build('Alchemist', 'potion', filteredItems as unknown[]))
                .window()
                .its('game')
                .then(game => {
                  const table = getTable(game, 'Alchemist - potion')
                  expect(table).to.not.be.undefined
                  const tableResults = [...table.results.values()]
                  expect(tableResults.length).to.eq(0)
                  if (filteredItems[0].system.traits === undefined) throw new Error('Rarity Undefined')
                  filteredItems[0].system.traits.rarity = 'uncommon'
                })
            })
        })
    })
    it('handling an item with out a level', () => {
      cy.waitMainReady()
        .then(main => {
          cy.wrap(getItems(main))
            .then(items => {
              const filteredItems = (items as PathfinderItem[]).filter(item => item.name === 'Invisibility Potion')
              if (filteredItems[0].system.level?.value === undefined) throw new Error('level Undefined')
              // @ts-expect-error: intentionally assigning a bad value
              filteredItems[0].system.level.value = undefined
              cy.wrap(main.tables.build('Alchemist', 'potion', filteredItems as unknown[]))
                .window()
                .its('game')
                .then(game => {
                  const table = getTable(game, 'Alchemist - potion')
                  expect(table).to.not.be.undefined
                  checkItemWeight(table, 'Invisibility Potion', 2205)
                  if (filteredItems[0].system.level === undefined) throw new Error('level Undefined')
                  filteredItems[0].system.level.value = '4'
                })
            })
        })
    })
    it('builds a list of tables', () => {
      cy.waitMainReady()
        .then(main => {
          cy.wrap(main.tables.buildAll([['Alchemist', 'potion'], ['Alchemist', 'bomb']]))
            .window()
            .its('game')
            .then(game => {
              const potions = getTable(game, 'Alchemist - potion')
              expect(potions).to.not.be.undefined
              const potionResults = [...potions.results.values()]
              expect(potionResults.length).to.eq(114)
              expect(main.progress[0].status).to.eq('done')

              const bombs = getTable(game, 'Alchemist - bomb')
              expect(bombs).to.not.be.undefined
              const bombResults = [...bombs.results.values()]
              expect(bombResults.length).to.eq(43)
              expect(main.progress[1].status).to.eq('done')
            })
        })
    })
    it('cancels building a list of tables', () => {
      cy.waitMainReady()
        .then(main => {
          let iterations = 0
          cy.stub(main.tables, 'build', () => {
            iterations = iterations + 1
            console.log(iterations, main.progress)
            main.tables.cancel()
          })
          cy.wrap(main.tables.buildAll([['Alchemist', 'potion'], ['Alchemist', 'bomb']]))
            .then(() => {
              expect(main.progress[0].status).to.eq('done')
              expect(main.progress[1].status).to.eq('canceled')
            })
        })
    })
  })
})
