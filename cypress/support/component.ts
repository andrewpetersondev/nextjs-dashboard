/// <reference types="cypress" />

import "./commands.ts";
import "./cypress-global.css";

import { type MountOptions, mount } from "cypress/react";
import type { ReactNode } from "react";

// Register the mount command for component testing
Cypress.Commands.add(
	"mount",
	(component: ReactNode, options?: Partial<MountOptions>) => {
		return mount(component, options);
	},
);

// Register additional custom mount commands if needed
Cypress.Commands.add(
	"mountV1",
	(component: ReactNode, options?: Partial<MountOptions>) => {
		return mount(component, options);
	},
);

Cypress.Commands.add(
	"mountV2",
	(component: ReactNode, options?: Partial<MountOptions>) => {
		return mount(component, options);
	},
);

// Note: No type declarations are needed here since the commands are already defined in cypress/support/commands.d.ts
