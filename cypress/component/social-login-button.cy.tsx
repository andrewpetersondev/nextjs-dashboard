import { SocialLoginButton } from "@/ui/auth/social-login-button.tsx";

describe("<SocialLoginButton />", () => {
  it("renders Google button", () => {
    cy.mount(
      <SocialLoginButton
        dataCy="google-btn"
        href="/api/auth/google"
        mode="signup"
        provider="Google"
      />,
    );
    cy.get("[data-cy=google-btn]").should("contain.text", "Google");
    cy.get("[data-cy=google-btn]").should(
      "have.attr",
      "href",
      "/api/auth/google",
    );
    cy.get("[data-cy=google-btn]").should(
      "have.attr",
      "aria-label",
      "Sign up with Google",
    );
  });

  it("renders GitHub button", () => {
    cy.mount(
      <SocialLoginButton
        dataCy="github-btn"
        href="/api/auth/github"
        mode="login"
        provider="GitHub"
      />,
    );
    cy.get("[data-cy=github-btn]").should("contain.text", "GitHub");
    cy.get("[data-cy=github-btn]").should(
      "have.attr",
      "aria-label",
      "Sign in with GitHub",
    );
  });
});
