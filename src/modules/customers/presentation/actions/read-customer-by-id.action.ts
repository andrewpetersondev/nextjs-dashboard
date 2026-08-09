"use server";
import { requireSession } from "@/modules/auth/presentation/session/session-access.guard";
import type { CustomerDto } from "@/modules/customers/application/dtos/customer.dto";
import { createCustomerId } from "@/modules/customers/domain/customer-id.factory";
import { createCustomerService } from "@/modules/customers/infrastructure/factories/customer-service.factory";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Reads one customer for the edit page.
 *
 * Returns `null` for both "no such customer" and "not a valid id" — the page
 * turns either into a 404, so distinguishing them would only leak whether an
 * id is well-formed.
 */
export async function readCustomerByIdAction(
	id: string,
): Promise<CustomerDto | null> {
	await requireSession();

	const idRes = createCustomerId(id);
	if (!idRes.ok) {
		return null;
	}

	const service = createCustomerService(getAppDb());
	const result = await service.readCustomerById(idRes.value);

	return result.ok ? result.value : null;
}
