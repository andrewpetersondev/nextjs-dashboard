/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";

declare global {
  namespace Cypress {

    type TestUser = {
      username: string;
      email: string;
      password: string;
    };

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
       * Custom command to log in a user via the application's login form (UI only, no API).
       * Fills out and submits the login form as a user would.
       * @param email The user's email
       * @param password The user's password
       * @example cy.login('user@example.com', 'password123')
       */
      login(user: { username: string; email: string; password: string }): Chainable<void>;

      /**
       * Custom command to sign up a user via the application's signup flow (UI only, no API).
       * Fills out and submits the signup form as a user would.
       * @param user The user object containing username, email, and password
       * @example cy.signup({ username: 'testuser', email: 'testuser@example.com', password: 'Password123!' })
       */
      signup(user: { username: string; email: string; password: string }): Chainable<void>;

      /**
       * Custom command to create a test user directly in the database (bypasses UI/API).
       * Use this for setting up test data quickly.
       * @param user The user object containing username, email, and password
       * @example cy.createTestUser({ username: 'testuser', email: 'testuser@example.com', password: 'Password123!' })
       */
      createTestUser(user: TestUser): Chainable<void>;

      /**
       * Custom command to delete a test user directly from the database (bypasses UI/API).
       * @param email The user's email
       * @example cy.deleteTestUser('user@example.com')
       */
      deleteTestUser(email: string): Chainable<void>;

      /**
       * Custom task to log to console
       * @example cy.task('logToConsole', 'Hello, world!')
       */
      task(
        name: "logToConsole",
        message: string,
      ),

      /**
      *  Cypress task for directly inserting into the database within tests
      */
      task(
        name: "db:insert",
        user: { username: string; email: string; password: string },
      ): Chainable<string>;

      /**
      *  Cypress task for directly removing from the database within tests
      */
      task(
        name: "db:delete",
        email: string,
      ): Chainable<string>;
    }
  }
}
