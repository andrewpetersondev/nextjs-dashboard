import { describe, expect, it, vi } from "vitest";
import type { InvoiceDto } from "@/modules/invoices/application/dto/invoice.dto";
import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import type { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

const INVOICE_ID = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_ID = "22222222-2222-4222-8222-222222222222";

function makeDto(status: InvoiceStatus): InvoiceDto {
	return {
		amount: 1000,
		customerId: CUSTOMER_ID,
		date: "2026-01-01",
		id: INVOICE_ID,
		revenuePeriod: "2026-01-01",
		sensitiveData: "cantTouchThis",
		status,
	};
}

function makeService(currentStatus: InvoiceStatus): {
	read: ReturnType<typeof vi.fn>;
	service: InvoiceService;
	update: ReturnType<typeof vi.fn>;
} {
	const read = vi.fn().mockResolvedValue(makeDto(currentStatus));
	const update = vi.fn().mockResolvedValue(makeDto(currentStatus));
	const repoStub = { read, update } as unknown as InvoiceRepository;
	return { read, service: new InvoiceService(repoStub), update };
}

describe("InvoiceService.updateInvoice — transition guard", () => {
	it("passes a legal transition through with the expectedStatus precondition", async () => {
		const { read, service, update } = makeService("pending");

		const result = await service.updateInvoice(INVOICE_ID, { status: "paid" });

		expect(result.ok).toBe(true);
		expect(read).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith(
			INVOICE_ID,
			{ status: "paid" },
			"pending",
		);
	});

	it("rejects an illegal transition before any write happens", async () => {
		const { service, update } = makeService("paid");

		const result = await service.updateInvoice(INVOICE_ID, {
			status: "pending",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			expect(result.error.message).toBe(INVOICE_MSG.invalidStatusTransition);
		}
		expect(update).not.toHaveBeenCalled();
	});

	it("treats re-submitting the current status as a no-op update WITHOUT a precondition", async () => {
		const { service, update } = makeService("paid");

		const result = await service.updateInvoice(INVOICE_ID, { status: "paid" });

		expect(result.ok).toBe(true);
		// Unchanged status → no expectedStatus, so a plain field save can never
		// trip a false conflict.
		expect(update).toHaveBeenCalledWith(
			INVOICE_ID,
			{ status: "paid" },
			undefined,
		);
	});

	it("skips the current-row read entirely when the update carries no status", async () => {
		const { read, service, update } = makeService("pending");

		const result = await service.updateInvoice(INVOICE_ID, { amount: 12.5 });

		expect(result.ok).toBe(true);
		expect(read).not.toHaveBeenCalled();
		expect(update).toHaveBeenCalledWith(
			INVOICE_ID,
			{ amount: 1250 },
			undefined,
		);
	});
});
