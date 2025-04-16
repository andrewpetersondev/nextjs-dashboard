import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }

    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<void>;
    }
  }
}