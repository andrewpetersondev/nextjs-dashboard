import { makeMockLogger } from "@test-support/mocks/logger.mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CustomerRepositoryContract } from "@/modules/customers/application/contracts/customer-repository.contract";
import { CustomerService } from "@/modules/customers/application/services/customer.service";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import { CUSTOMER_IMAGE_URL_NONE } from "@/modules/customers/domain/customer-policy";
import type { CustomerEntity } from "@/modules/customers/domain/types";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";

const CUSTOMER_UUID = "77777777-7777-4777-8777-777777777777";
const CUSTOMER_ID = toCustomerId(CUSTOMER_UUID);

const EXISTING: CustomerEntity = {
	email: "amy@burns.com",
	id: CUSTOMER_ID,
	imageUrl: "/customers/amy-burns.png",
	name: "Amy Burns",
};

type MockRepo = {
	[K in keyof CustomerRepositoryContract]: ReturnType<typeof vi.fn>;
};

function makeRepo(overrides: Partial<MockRepo> = {}): MockRepo {
	return {
		countInvoices: vi.fn().mockResolvedValue(Ok(0)),
		create: vi.fn().mockResolvedValue(Ok(EXISTING)),
		delete: vi.fn().mockResolvedValue(Ok(EXISTING)),
		readById: vi.fn().mockResolvedValue(Ok(EXISTING)),
		update: vi.fn().mockResolvedValue(Ok(EXISTING)),
		...overrides,
	};
}

function makeService(repo: MockRepo): CustomerService {
	return new CustomerService(
		repo as unknown as CustomerRepositoryContract,
		makeMockLogger(),
	);
}

describe("CustomerService.deleteCustomer", () => {
	let repo: MockRepo;

	beforeEach(() => {
		repo = makeRepo();
	});

	it("deletes a customer that has no invoices", async () => {
		const result = await makeService(repo).deleteCustomer(CUSTOMER_ID);

		expect(result.ok).toBe(true);
		expect(result.ok && result.value.status).toBe("deleted");
		expect(repo.delete).toHaveBeenCalledWith(CUSTOMER_ID);
	});

	it("NEVER reaches the delete when invoices reference the customer", async () => {
		// The load-bearing assertion. `invoices.customer_id` is ON DELETE CASCADE,
		// so reaching `repo.delete` at all would destroy those invoices — the
		// guard has to stop short of the call, not merely report afterwards.
		repo.countInvoices.mockResolvedValue(Ok(8));

		const result = await makeService(repo).deleteCustomer(CUSTOMER_ID);

		expect(repo.delete).not.toHaveBeenCalled();
		expect(result.ok).toBe(true);
		expect(result.ok && result.value).toEqual({
			customer: expect.objectContaining({ name: "Amy Burns" }),
			invoiceCount: 8,
			status: "blocked",
		});
	});

	it("reports a blocked delete as an outcome, not as an error", async () => {
		// A refusal is an expected state of the world; `Err` is reserved for
		// technical failure. Collapsing the two would make the action unable to
		// tell "database is down" from "this customer has invoices".
		repo.countInvoices.mockResolvedValue(Ok(1));

		const result = await makeService(repo).deleteCustomer(CUSTOMER_ID);

		expect(result.ok).toBe(true);
	});

	it("returns not-found without counting or deleting", async () => {
		repo.readById.mockResolvedValue(Ok(null));

		const result = await makeService(repo).deleteCustomer(CUSTOMER_ID);

		expect(result.ok && result.value.status).toBe("not-found");
		expect(repo.countInvoices).not.toHaveBeenCalled();
		expect(repo.delete).not.toHaveBeenCalled();
	});

	it("propagates a failed count as an error and does not delete", async () => {
		// Failing open here would delete the customer — and their invoices —
		// precisely when the guard could not verify it was safe.
		repo.countInvoices.mockResolvedValue(
			Err(
				makeAppError(APP_ERROR_KEYS.database, {
					cause: "boom",
					message: "count failed",
					metadata: {},
				}),
			),
		);

		const result = await makeService(repo).deleteCustomer(CUSTOMER_ID);

		expect(result.ok).toBe(false);
		expect(repo.delete).not.toHaveBeenCalled();
	});
});

describe("CustomerService.updateCustomer", () => {
	it("sends only the fields that actually changed", async () => {
		const repo = makeRepo();

		await makeService(repo).updateCustomer(CUSTOMER_ID, {
			email: EXISTING.email,
			name: "Amy B. Burns",
		});

		expect(repo.update).toHaveBeenCalledWith(CUSTOMER_ID, {
			name: "Amy B. Burns",
		});
	});

	it("skips the update entirely when nothing changed", async () => {
		// An `UPDATE ... SET` with no assignments is a SQL syntax error, so the
		// empty patch must never reach the DAL.
		const repo = makeRepo();

		const result = await makeService(repo).updateCustomer(CUSTOMER_ID, {
			email: EXISTING.email,
			name: EXISTING.name,
		});

		expect(repo.update).not.toHaveBeenCalled();
		expect(result.ok && result.value.status).toBe("unchanged");
	});

	it("treats an absent field as 'leave unchanged'", async () => {
		const repo = makeRepo();

		const result = await makeService(repo).updateCustomer(CUSTOMER_ID, {});

		expect(repo.update).not.toHaveBeenCalled();
		expect(result.ok && result.value.status).toBe("unchanged");
	});
});

describe("CustomerService.createCustomer", () => {
	it("supplies the no-image marker, since the form has no image field", async () => {
		const repo = makeRepo();

		await makeService(repo).createCustomer({
			email: "new@example.com",
			name: "New Customer",
		});

		expect(repo.create).toHaveBeenCalledWith({
			email: "new@example.com",
			imageUrl: CUSTOMER_IMAGE_URL_NONE,
			name: "New Customer",
		});
	});
});
