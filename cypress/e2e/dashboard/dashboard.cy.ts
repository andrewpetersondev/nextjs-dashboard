// cypress/e2e/dashboard.cy.ts
describe('Dashboard Page Navigation', () => {
  beforeEach(() => {
    // Visit the dashboard page before each test
    cy.visit('http://localhost:3000/dashboard')
  })

  it('should verify all links are working', () => {
    // Get all links on the page
    cy.get('a').each(($link) => {
      const href = $link.prop('href')
      if (href && !href.includes('javascript:')) {
        // Click the link
        cy.wrap($link).click()

        // Verify the page loaded successfully
        cy.url().should('not.eq', 'http://localhost:3000/dashboard')
        cy.document().its('body').should('exist')
        cy.get('body').should('not.have.text', 'Not Found')
        cy.get('body').should('not.have.text', '404')

        // Go back to dashboard for next link
        cy.go('back')
      }
    })
  })

  // Additional test for specific navigation elements
  it('should have working main navigation elements', () => {
    // Add specific checks for important navigation elements
    // This is useful for critical paths in your application
    cy.get('nav').should('exist')
    cy.get('nav a').should('have.length.at.least', 1)
  })
})
