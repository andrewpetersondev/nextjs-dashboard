/// <reference types="cypress" />

import { mount } from "cypress/react";
import "../commands/commands";
// Import simplified CSS for Cypress component tests instead of the original global CSS
// to avoid issues with lightningcss
import "./cypress-global.css";

Cypress.Commands.add("mount", mount);
