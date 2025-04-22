import {mount} from "cypress/react";

type MountFunction = typeof mount;

declare global {
  namespace Cypress {
    interface Chainable {
      mount: MountFunction;
    }
  }
}
