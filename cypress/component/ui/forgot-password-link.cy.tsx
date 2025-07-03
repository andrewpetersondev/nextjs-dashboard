import { ForgotPasswordLink } from "../../../src/ui/auth/forgot-password-link.tsx";

describe("<ForgotPasswordLink />", () => {
	it("renders link to forgot password", () => {
		cy.mount(<ForgotPasswordLink />);
		cy.get("a[href='/forgot-password']").should(
			"contain.text",
			"Forgot password?",
		);
	});
});
