import moduleInfo from '../../../src/module.json'
describe('Config Sources', () => {
  beforeEach('Open Config', () => {
    cy.login()
    cy.get('nav[id=sidebar-tabs] a[data-tab=settings]').click()
    cy.get('div[id=sidebar] section[id=settings] button[data-action=configure]').click()
    cy.get('div[id=client-settings] a[data-tab=rpg-tools-logistics-boy]').click()
    cy.get('div[id=client-settings] button[data-key="rpg-tools-logistics-boy.sourceMenu"]').click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(`div[id=${moduleInfo.name}-config-sources-app]`)
      .should('have.attr', 'style', 'z-index: 101; width: 880px; height: 720px; left: 520px; top: 180px;')
      .wait(250)
  })
  afterEach('Restore Defaults', () => {
    cy.window().its('game').its('settings').then(settings => {
      cy.fixture<string[]>('defaultSources').then(defaultSources => {
        cy.fixture<string[]>('sources').each((source: string) => {
          settings.set(moduleInfo.name, source, defaultSources.includes(source))
        })
      })
    })
  })
  it('Lists all available sources, checking defaults', () => {
    cy.fixture<string[]>('sources').then(sources => {
      const sourcesNotFound = [...sources]
      cy.fixture<string[]>('defaultSources')
        .then(defaultSources => {
          cy.get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input`)
            .each<HTMLInputElement>($input => {
              const index = sourcesNotFound.indexOf($input[0].value)
              expect(index).to.be.gt(-1)
              sourcesNotFound.splice(index, 1)
              expect(defaultSources.includes($input[0].value)).to.eq($input[0].checked)
            })
            .then(() => {
              expect(sourcesNotFound.length).to.eq(0)
            })
        })
    })
  })
  it('Selects all/default/none', () => {
    cy.fixture<string[]>('defaultSources').then(defaultSources => {
      cy.get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input`).each<HTMLInputElement>($input => {
        expect($input[0].checked).to.eq(defaultSources.includes($input[0].value))
      })
      cy.get(`section[id=${moduleInfo.name}-config-sources] a[data-action="select-all"]`).click()
        .get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input`)
        .each<HTMLInputElement>($input => {
          console.log($input[0].value, $input[0].checked)
          expect($input[0].checked).to.be.true
        })
      cy.get(`section[id=${moduleInfo.name}-config-sources] a[data-action="select-default"]`).click()
        .get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input`)
        .each<HTMLInputElement>($input => {
          expect(defaultSources.includes($input[0].value)).to.eq($input[0].checked)
        })
      cy.get(`section[id=${moduleInfo.name}-config-sources] a[data-action="select-none"]`).click()
        .get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input`)
        .each<HTMLInputElement>($input => {
          expect($input[0].checked).to.be.false
        })
    })
  })
  it('Saves Changes when clicking button', () => {
    cy.fixture<string[]>('defaultSources').then(defaultSources => {
      const firstDefault = defaultSources[0]
      cy.window().its('game').its('settings').then(settings => {
        expect(settings.get(moduleInfo.name, firstDefault)).to.be.true
        cy.get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input[value="${firstDefault}"]`)
          .click()
          .then(() => {
            cy.get(`section[id=${moduleInfo.name}-config-sources] button[type=submit]`)
              .click()
              .then(() => {
                expect(settings.get(moduleInfo.name, firstDefault)).to.be.false
              })
          })
      })
    })
  })
  it('Saves Changes when clicking close', () => {
    cy.fixture<string[]>('defaultSources').then(defaultSources => {
      const firstDefault = defaultSources[0]
      cy.window().its('game').its('settings').then(settings => {
        expect(settings.get(moduleInfo.name, firstDefault)).to.be.true
        cy.get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input[value="${firstDefault}"]`)
          .click()
          .then(() => {
            cy.get(`div[id=${moduleInfo.name}-config-sources-app] button[type=submit]`)
              .click()
              .then(() => {
                expect(settings.get(moduleInfo.name, firstDefault)).to.be.false
              })
          })
      })
    })
  })
  it.only('Handles a bad action', () => {
    cy.window().its('ui').then(ui => {
      cy.spy(ui.notifications, 'error')
      cy.get<HTMLAnchorElement[]>(`section[id=${moduleInfo.name}-config-sources] a[data-action="select-all"]`)
        .then($link => {
          $link[0].dataset.action = 'bad-action'
          return $link[0]
        })
        .click()
        .then(() => {
          expect(ui.notifications.error).to.be.called
        })
    })
      /* .click()
      .get<HTMLInputElement[]>(`section[id=${moduleInfo.name}-config-sources] ul.${moduleInfo.name}-checkbox-list input`)
      .each<HTMLInputElement>($input => {
        console.log($input[0].value, $input[0].checked)
        expect($input[0].checked).to.be.true
      }) */
  })
})
