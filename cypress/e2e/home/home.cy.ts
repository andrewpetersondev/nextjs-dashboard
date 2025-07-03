interface ScreenDimensions {
	width: number;
	height: number;
}

interface ScreenSizes {
	[key: string]: ScreenDimensions;
}

// type DeviceType = "mobile" | "tablet" | "desktop";

const screenSizes: ScreenSizes = {
	desktop: { height: 800, width: 1280 },
	mobile: { height: 640, width: 360 },
	tabletLandscape: { height: 768, width: 1024 },
	tabletPortrait: { height: 1024, width: 768 },
} as const;

// const getDeviceType = (width: number): DeviceType => {
//   if (width <= 640) return "mobile";
//   if (width <= 1024) return "tablet";
//   return "desktop";
// };

describe("Layout and Page Components", () => {
	describe("Layout Component", () => {
		for (const [device, dimensions] of Object.entries(screenSizes)) {
			describe(`${device} view (${dimensions.width}x${dimensions.height})`, () => {
				beforeEach(() => {
					cy.viewport(dimensions.width, dimensions.height);
					cy.visit("/");
				});

				it("should render with the correct base structure", () => {
					cy.get("html")
						.should("have.class", "scheme-light-dark")
						.and("have.class", "h-full");

					cy.get("body")
						.should("have.class", "h-full")
						.and("have.class", "antialiased")
						.and("have.class", "scheme-light-dark");
				});

				it("should have correct meta-information", () => {
					cy.title().should("eq", "Acme Dashboard");
					cy.get('meta[name="description"]').should(
						"have.attr",
						"content",
						"The official Next.js Learn Dashboard built with App Router.",
					);
				});
			});
		}
	});

	// describe("Home Page Component", () => {
	//   for (const [device, dimensions] of Object.entries(screenSizes)) {
	//     describe(`${device} view (${dimensions.width}x${dimensions.height})`, () => {
	//       beforeEach(() => {
	//         cy.viewport(dimensions.width, dimensions.height);
	//         cy.visit("/");
	//       });

	//       it("should render the main content correctly", () => {
	//         cy.get("main")
	//           .should("have.class", "flex")
	//           .and("have.class", "min-h-screen")
	//           .and("have.class", "flex-col")
	//           .and("have.class", "p-6");
	//       });

	//       it("should display Acme logo", () => {
	//         cy.get('[data-testid="acme-logo"]').should("be.visible");
	//       });

	//       it("should display welcome text content with correct sizing", () => {
	//         cy.contains("Welcome to Acme").should("be.visible");
	//         const deviceType = getDeviceType(dimensions.width);

	//         if (deviceType === "mobile") {
	//           cy.get(".text-xl").should("exist");
	//         } else {
	//           cy.get(".md\\:text-3xl").should("exist");
	//         }
	//       });

	//       it("should have a properly sized login button", () => {
	//         const deviceType = getDeviceType(dimensions.width);

	//         cy.get('[data-testid="login-button"]')
	//           .should("be.visible")
	//           .and("have.attr", "href", "/login")
	//           .find("span")
	//           .should("contain", "Log in");

	//         // Check icon sizing based on device type
	//         cy.get('[data-testid="login-button"] svg')
	//           .should(
	//             deviceType === "mobile" ? "have.class" : "not.have.class",
	//             "w-5",
	//           )
	//           .should("have.class", "md:w-6");
	//       });

	//       it("should display the correct hero image based on orientation and device", () => {
	//         const deviceType = getDeviceType(dimensions.width);

	//         if (deviceType === "mobile") {
	//           cy.get('img[alt*="mobile version"]')
	//             .should("be.visible")
	//             .and("have.class", "block")
	//             .and("have.class", "md:hidden");
	//           cy.get('img[alt*="desktop version"]').should("not.be.visible");
	//         } else {
	//           cy.get('img[alt*="desktop version"]')
	//             .should("be.visible")
	//             .and("have.class", "hidden")
	//             .and("have.class", "md:block");
	//           cy.get('img[alt*="mobile version"]').should("not.be.visible");
	//         }
	//       });

	//       it("should have the correct layout for content sections based on orientation", () => {
	//         cy.get(".mt-4").should("have.class", "flex");

	//         if (device.includes("tablet")) {
	//           if (device === "tabletPortrait") {
	//             cy.get(".bg-bg-accent")
	//               .should("have.class", "md:w-2/5")
	//               .and("have.class", "md:px-20");
	//             cy.get(".md\\:flex-row").should("exist");
	//           } else {
	//             cy.get(".bg-bg-accent").should("have.class", "md:w-2/5");
	//             cy.get(".md\\:px-28").should("exist");
	//           }
	//         }
	//       });

	//       it("should maintain proper spacing and padding", () => {
	//         if (device.includes("tablet")) {
	//           if (device === "tabletPortrait") {
	//             cy.get(".px-6").should("exist");
	//             cy.get(".md\\:px-20").should("exist");
	//           } else {
	//             cy.get(".md\\:px-28").should("exist");
	//           }
	//         }

	//         cy.get(".gap-4").should("exist");
	//         cy.get(".gap-6").should("exist");
	//       });

	//       it("should handle text wrapping and overflow properly", () => {
	//         cy.get(".text-xl, .md\\:text-3xl").should(
	//           "have.css",
	//           "overflow-wrap",
	//           "break-word",
	//         );
	//       });

	//       if (device.includes("tablet")) {
	//         it("should maintain an aspect ratio of images in the tablet view", () => {
	//           cy.get('img[alt*="desktop version"]').should(($img) => {
	//             const aspectRatio = $img[0].naturalWidth / $img[0].naturalHeight;
	//             expect(aspectRatio).to.be.closeTo(1000 / 760, 0.1);
	//           });
	//         });
	//       }
	//     });
	//   }
	// });
});
