import { SESSION_COOKIE_NAME } from "@/lib/auth/auth.ui.constants.ts";
import { TEST_USER_CREDENTIALS, TEST_USER_DB } from "../../../support/types.ts";

const DASHBOARD_ROUTE = "/dashboard";
const DASHBOARD_TEXT = "Dashboard";

const TEST_USER = {
  email: TEST_USER_CREDENTIALS.email,
  password: TEST_USER_CREDENTIALS.password,
  username: TEST_USER_CREDENTIALS.username,
  // role: "user", // Optional, omitted to use Db default
};

describe("loginSession command", () => {
  before(() => {
    cy.ensureUserDeleted(TEST_USER.email).then(() => {
      cy.createUser({ ...TEST_USER });
    });
  });

  after(() => {
    cy.ensureUserDeleted(TEST_USER.email);
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should access dashboard with a mock session cookie", () => {
    cy.findUser(TEST_USER_DB.email).then((user) => {
      expect(user?.id, "User should have an id").to.exist;
      cy.setMockSessionCookie(user.id, "user");
      cy.visit(DASHBOARD_ROUTE);
      cy.contains(DASHBOARD_TEXT).should("be.visible");
    });
  });

  it("should log in and cache the session for the user", () => {
    cy.loginSession(TEST_USER_DB);
    cy.visit(DASHBOARD_ROUTE);
    cy.url().should("include", DASHBOARD_ROUTE);
    cy.getCookie(SESSION_COOKIE_NAME).should("exist");
  });

  it("should restore the cached session on subsequent tests", () => {
    cy.loginSession(TEST_USER_DB);
    cy.visit(DASHBOARD_ROUTE);
    cy.contains(DASHBOARD_TEXT).should("be.visible");
    cy.getCookie(SESSION_COOKIE_NAME).should("exist");
  });
});
