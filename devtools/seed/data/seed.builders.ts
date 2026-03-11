import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import type {
	NewInvoice,
	SeedCustomerIdRow,
	SeedUserRow,
} from "@devtools/seed/data/seed.types";
import { seedUserInputs } from "@devtools/seed/data/seed.users";
import { buildInvoiceDateForPeriod } from "@devtools/seed/seed-periods";
import { hashPassword } from "@devtools/users/hash-password";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers"; // TODO: REMOVE CODE FROM SRC

function generateInvoiceAmount(): number {
	const r = Math.random();
	if (r < SEED_CONFIG.zeroAmountProbability) {
		return 0;
	}
	if (
		r <
		SEED_CONFIG.zeroAmountProbability + SEED_CONFIG.singleCentProbability
	) {
		return SEED_CONFIG.singleCentAmount;
	}
	if (
		r <
		SEED_CONFIG.zeroAmountProbability +
			SEED_CONFIG.singleCentProbability +
			SEED_CONFIG.minAmountProbability
	) {
		return SEED_CONFIG.minAmountCents;
	}
	if (r < SEED_CONFIG.invoiceRegularThreshold) {
		return (
			Math.floor(
				Math.random() *
					(SEED_CONFIG.maxAmountCents - SEED_CONFIG.minAmountCents + 1),
			) + SEED_CONFIG.minAmountCents
		);
	}
	return (
		Math.floor(
			Math.random() *
				(SEED_CONFIG.maxLargeAmountCents -
					SEED_CONFIG.largeAmountThreshold +
					1),
		) + SEED_CONFIG.largeAmountThreshold
	);
}

function randomInvoiceStatus(): "pending" | "paid" {
	return Math.random() < SEED_CONFIG.invoiceStatusPendingProbability
		? "pending"
		: "paid";
}

function pickRandomItem<T>(items: ReadonlyArray<T>): T {
	if (items.length === 0) {
		throw new Error("pickRandomItem requires at least one item");
	}

	const index = Math.floor(Math.random() * items.length);
	const item = items.at(index);

	if (item === undefined) {
		throw new Error(`No item found at index ${index}`);
	}

	return item;
}

/**
 * Build demo users with hashed passwords.
 */
export function buildUserSeed(): Promise<ReadonlyArray<SeedUserRow>> {
	return Promise.all(
		seedUserInputs.map(async ({ email, password, role, username }) => ({
			email,
			password: await hashPassword(password),
			role,
			username,
		})),
	);
}

/**
 * Build randomized invoice rows based on existing customers and available periods.
 */
export function buildRandomInvoiceRows(
	existingCustomers: ReadonlyArray<SeedCustomerIdRow>,
	availablePeriods: ReadonlyArray<string>,
): NewInvoice[] {
	if (existingCustomers.length === 0) {
		throw new Error("buildRandomInvoiceRows requires at least one customer");
	}
	if (availablePeriods.length === 0) {
		throw new Error("buildRandomInvoiceRows requires at least one period");
	}

	return Array.from({ length: SEED_CONFIG.invoiceCount }, () => {
		const customer = pickRandomItem(existingCustomers);
		const period = pickRandomItem(availablePeriods);
		const { invoiceDate, revenuePeriod } = buildInvoiceDateForPeriod(period);

		return {
			amount: generateInvoiceAmount(),
			customerId: toCustomerId(customer.id),
			date: invoiceDate,
			revenuePeriod,
			status: randomInvoiceStatus(),
		} as NewInvoice;
	});
}
