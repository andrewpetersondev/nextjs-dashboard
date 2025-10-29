import { STATUS_CODES } from "../shared/status-codes";

describe("Seed DB", () => {
  it("should seed the database via API and return ok: true", () => {
    cy.request<{
      action: string;
      ok: boolean;
      error?: string;
    }>({
      failOnStatusCode: false,
      method: "GET",
      url: "/api/db/seed",
    }).then((res) => {
      expect(
        res.status,
        `HTTP status: ${res.status}, body: ${JSON.stringify(res.body)}`,
      ).to.eq(STATUS_CODES.ok);
      expect(res.body).to.have.property("action", "seed");
      expect(res.body).to.have.property("ok", true);
    });
  });
});
