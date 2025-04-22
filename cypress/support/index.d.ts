/// <reference types="cypress" />

import React from "react";
import { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<void>;
    }
  }
}