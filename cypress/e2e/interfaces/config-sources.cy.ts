import meta from '../../../src/module.json'
import i18n from '../../../assets/lang/en.json'

describe('interfaces/config-sources.ts', { testIsolation: false }, () => {
  before('Load Foundry', () => {
    cy.login({ world: 'PF2e' })
  })
  beforeEach('open interface', () => {
    cy.clickSidebarButton('settings', 'configure')
      .openConfigMenu(meta.name, 'rtlb.sourceMenu')
  })
  afterEach('close interface', () => {
    cy.closeFoundryApp('rtlb-config-sources-app')
      .closeFoundryApp('client-settings')
  })
  afterEach('reset defaults', () => {
    cy.window().its('game').its('settings').then(settings => {
      cy.fixture<string[]>('defaultSources').then(defaultSources => {
        cy.fixture<string[]>('sources').each((source: string) => {
          settings.set(meta.name, source, defaultSources.includes(source))
        })
      })
    })
  })
  describe('Renders correctly by', () => {
    it('displaying styles', () => {
      cy.get('#rtlb-config-sources-content header')
        .should('have.css', 'background-color', 'rgb(0, 0, 0)')
    })
    it('listing sources', () => {
      cy.fixture<string[]>('sources')
        .then(sources => {
          const sourcesNotFound = [...sources]
          cy.fixture<string[]>('defaultSources')
            .then(defaultSources => {
              cy.get<HTMLInputElement[]>('section[id=rtlb-config-sources-content] ul.rtlb-checkbox-list input')
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
  })
  describe('Updates checked items when', () => {
    it('select: all is clicked', () => {
      cy.get('section[id=rtlb-config-sources-content] a[data-action="select-all"]')
        .click()
        .get<HTMLInputElement[]>('section[id=rtlb-config-sources-content] ul.rtlb-checkbox-list input')
        .each<HTMLInputElement>($input => {
          expect($input[0].checked).to.be.true
        })
    })
    it('select: default is clicked', () => {
      cy.fixture<string[]>('defaultSources')
        .then(defaultSources => {
          cy.get('section[id=rtlb-config-sources-content] a[data-action="select-default"]')
            .click()
            .get<HTMLInputElement[]>('section[id=rtlb-config-sources-content] ul.rtlb-checkbox-list input')
            .each<HTMLInputElement>($input => {
              expect(defaultSources.includes($input[0].value)).to.eq($input[0].checked)
            })
        })
    })
    it('select: none is clicked', () => {
      cy.get('section[id=rtlb-config-sources-content] a[data-action="select-none"]')
        .click()
        .get<HTMLInputElement[]>('section[id=rtlb-config-sources-content] ul.rtlb-checkbox-list input')
        .each<HTMLInputElement>($input => {
          expect($input[0].checked).to.be.false
        })
    })
  })
  describe('Saves Changes', () => {
    it('when clicking button', () => {
      cy.fixture<string[]>('defaultSources')
        .then(defaultSources => {
          const firstDefault = defaultSources[0]
          cy.window().its('game').its('settings').then(settings => {
            expect(settings.get(meta.name, firstDefault)).to.be.true
            cy.get<HTMLInputElement[]>(`section[id=rtlb-config-sources-content] ul.rtlb-checkbox-list input[value="${firstDefault}"]`)
              .click()
              .then(() => {
                cy.get('section[id=rtlb-config-sources-content] button[type=submit]')
                  .click()
                  .then(() => {
                    expect(settings.get(meta.name, firstDefault)).to.be.false
                  })
              })
          })
        })
    })
    it('when clicking close', () => {
      cy.fixture<string[]>('defaultSources').then(defaultSources => {
        const firstDefault = defaultSources[0]
        cy.window().its('game').its('settings').then(settings => {
          expect(settings.get(meta.name, firstDefault)).to.be.true
          cy.get<HTMLInputElement[]>(`section[id=rtlb-config-sources-content] ul.rtlb-checkbox-list input[value="${firstDefault}"]`)
            .click()
            .then(() => {
              cy.get('section[id=rtlb-config-sources-content] button[type=submit]')
                .click()
                .then(() => {
                  expect(settings.get(meta.name, firstDefault)).to.be.false
                })
            })
        })
      })
    })
  })
  describe('Handles an action that is', () => {
    it('invalid', () => {
      cy.try([
        `${meta.title}: ${i18n.RTLB.UnexpectedButtonAction} - bad-action`
      ])
        .get<HTMLAnchorElement[]>('section[id=rtlb-config-sources-content] a[data-action="select-all"]')
        .then($link => {
          $link[0].dataset.action = 'bad-action'
          return $link[0]
        })
        .click()
        .caught()
    })
    it('missing', () => {
      cy.try([
          `${meta.title}: ${i18n.RTLB.UnexpectedButtonAction} - none`
        ])
        .get<HTMLAnchorElement[]>('section[id=rtlb-config-sources-content] a[data-action="select-all"]')
        .then($link => {
          delete $link[0].dataset.action
          return $link[0]
        })
        .click()
        .caught()
    })
  })
})
