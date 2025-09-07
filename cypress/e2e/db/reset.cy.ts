import { STATUS_CODES } from "../shared/status-codes";

describe("Reset DB", () => {
  it("should reset the database via API and return ok: true", () => {
    cy.request<{
      action: string;
      ok: boolean;
      error?: string;
    }>({
      // Allow assertion-driven failure so we can show error details if any
      failOnStatusCode: false,
      method: "GET",
      url: "/api/db/reset",
    }).then((res) => {
      expect(
        res.status,
        `HTTP status: ${res.status}, body: ${JSON.stringify(res.body)}`,
      ).to.eq(STATUS_CODES.OK);
      expect(res.body).to.have.property("action", "reset");
      expect(res.body).to.have.property("ok", true);
    });
  });
});
