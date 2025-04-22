/// <reference types="cypress" />

import React from "react";
import LoginFormV2 from "@/src/ui/login-form-v2";

describe("Login Form", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/login");
    cy.mount(<LoginFormV2 />);
  });

  it("should render the component correctly", () => {
    cy.contains("Sign in to your account").should("exist");
    cy.get('[data-cy="login-email-input"]').should("exist");
    cy.get('[data-cy="login-password-input"]').should("exist");
    cy.get('button[type="submit"]').should("exist"); // Adjust selector if needed
  });
});
