import { TEST_USER_CREDENTIALS } from "../../../support/types.ts";

const TEST_USER = {
  email: TEST_USER_CREDENTIALS.email,
  password: TEST_USER_CREDENTIALS.password,
  username: TEST_USER_CREDENTIALS.username,
};

const LOGIN_CREDENTIALS = {
  email: TEST_USER.email,
  password: TEST_USER.password,
};

describe("Login E2E", () => {
  beforeEach(() => {
    return cy.ensureUserDeleted(TEST_USER.email).then(() => {
      return cy.createUser({ ...TEST_USER });
    });
  });

  afterEach(() => {
    return cy.ensureUserDeleted(TEST_USER.email);
  });

  it("should log in via the UI", () => {
    cy.login(LOGIN_CREDENTIALS);
    cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard");
    cy.get("h1").contains("Dashboard", { timeout: 10000 }).should("be.visible");
  });
});
