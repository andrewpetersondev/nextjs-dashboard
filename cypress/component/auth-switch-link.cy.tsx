import { AuthSwitchLink } from "@/ui/auth/auth-switch-link.tsx";

const loginRoute = "/login";

describe("<AuthSwitchLink />", () => {
  it("renders prompt and link", () => {
    cy.mount(
      <AuthSwitchLink
        href={loginRoute}
        linkText="Sign in here"
        prompt="Already a member?"
      />,
    );
    cy.get("p").should("contain.text", "Already a member?");
    cy.get("a[href='/login']").should("contain.text", "Sign in here");
  });
});
