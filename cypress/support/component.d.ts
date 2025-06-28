/// <reference types="cypress" />

import { type MountOptions, type MountReturn, mount } from "cypress/react";
import type { ReactNode } from "react";

declare global {
    // biome-ignore lint/style/noNamespace: I think this is fine
    namespace Cypress {
        interface Chainable {
            mount(
                component: ReactNode,
                options?: Partial<MountOptions>
            ): Chainable<MountReturn>;

            mountV1(
                component: ReactNode,
                options?: Partial<MountOptions>
            ): Chainable<MountReturn>;

            mountV2(
                component: ReactNode,
                options?: Partial<MountOptions>
            ): Chainable<MountReturn>;
        }
    }
}

export {};
