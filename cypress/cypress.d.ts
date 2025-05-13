/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount a React component in Cypress
       * @param component The React component to mount
       * @param options Additional mounting options
       * @example cy.mount(<MyComponent />)
       */
      mount(
        component: ReactNode,
        options?: Partial<MountOptions>,
      ): Chainable<MountReturn>;
      /**
       * Custom command to log in a user
       * @param email The user's email
       * @param password The user's password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to create a test user in the database
       * @param user The user object containing username, email, and password
       * @example cy.createTestUser({ username: 'testuser', email: 'testuser@example.com', password: 'Password123!' })
       */

      createTestUser(user: TestUser): Chainable<void>;
      /**
       * Custom command to delete a test user
       * @param email The user's email
       * @example cy.deleteTestUser('user@example.com')
       */
      deleteTestUser(email: string): Chainable<void>;
    }
  }
}
