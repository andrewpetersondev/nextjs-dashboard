/// <reference types="cypress" />

import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount a React component in Cypress
       * @param component The React component to mount
       * @param options Additional mounting options
       * @example cy.mount(<MyComponent />)
       */
      mount: typeof mount;
      /**
       * Custom command to log in a user
       * @param email The user's email
       * @param password The user's password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
