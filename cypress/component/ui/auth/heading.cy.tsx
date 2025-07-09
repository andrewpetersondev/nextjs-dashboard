import { Heading } from "@/src/ui/auth/heading.tsx";

describe("<Heading />", () => {
	it("renders logo and text", () => {
		cy.mount(<Heading text="Sign up" />);
		cy.get("img").should("have.attr", "alt");
		cy.get("h2").should("contain.text", "Sign up");
	});

	it("renders children", () => {
		cy.mount(
			<Heading text="Title">
				<span data-cy="child">Child</span>
			</Heading>,
		);
		cy.get("[data-cy=child]").should("contain.text", "Child");
	});
});
