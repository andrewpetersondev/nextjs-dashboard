describe.skip("File Upload Server Actions", () => {
  it("should upload file successfully", () => {
    cy.loginAsTestUser();
    cy.visit("/dashboard/documents");

    const fileName = "test-document.pdf";
    cy.fixture(fileName, "base64").then((fileContent) => {
      cy.get('[data-cy="file-upload-input"]').attachFile({
        encoding: "base64",
        fileContent,
        fileName,
        mimeType: "application/pdf",
      });
    });

    cy.intercept("POST", "/_server-actions/**").as("uploadAction");

    cy.get('[data-cy="upload-button"]').click();

    cy.wait("@uploadAction", { timeout: 30000 });
    cy.findByText(fileName).should("be.visible");
  });

  it("should reject invalid file types", () => {
    cy.loginAsTestUser();
    cy.visit("/dashboard/documents");

    cy.fixture("invalid-file.exe", "base64").then((fileContent) => {
      cy.get('[data-cy="file-upload-input"]').attachFile({
        encoding: "base64",
        fileContent,
        fileName: "invalid-file.exe",
        mimeType: "application/x-msdownload",
      });
    });

    cy.get('[data-cy="upload-button"]').click();
    cy.findByText(/Invalid file type/i).should("be.visible");
  });
});
