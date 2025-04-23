/// <reference types="cypress" />

import { mount } from "cypress/react";
import React from "react";

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to mount a React component in Cypress
       * @param component The React component to mount
       * @param options Additional mounting options
       * @example cy.mount(<MyComponent />)
       */
      mount: typeof mount;
    }
  }
}

export {};
