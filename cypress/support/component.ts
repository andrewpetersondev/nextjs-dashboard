/// <reference types="../cypress.d.ts" />
/// <reference types="cypress" />

import "./commands";
import "./cypress-global.css";

import { mount } from "cypress/react";

Cypress.Commands.add("mount", (component, options) => {
	return mount(component, options);
});
