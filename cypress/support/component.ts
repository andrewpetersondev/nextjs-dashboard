/// <reference types="cypress" />

import "./commands";
import "./cypress-global.css";

import { mount } from "cypress/react";

Cypress.Commands.add("mount", mount);
