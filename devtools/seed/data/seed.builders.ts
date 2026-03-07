import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import type { Period } from "@/shared/primitives/period/period.brand";
import { hashPassword } from "../../users/hash-password";
import { validatePeriod } from "../seed-periods";
import { SEED_CONFIG } from "./seed.constants";
import type { NewInvoice, SeedUserRow } from "./seed.types";
import { seedUsers } from "./seed.users";

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

function randomItem<T>(items: ReadonlyArray<T>): T | undefined {
	return items[Math.floor(Math.random() * items.length)];
}

function buildInvoiceDateForPeriod(period: string): {
	readonly invoiceDate: Date;
	readonly revenuePeriod: Period;
} {
	validatePeriod(period);

	const revenuePeriod = new Date(`${period}T00:00:00.000Z`) as Period;
	const [year, month] = period.split("-").map(Number);

	if (
		!(year && month) ||
		month < SEED_CONFIG.minMonth ||
		month > SEED_CONFIG.monthsInYear
	) {
		throw new Error(`Invalid period format: ${period}. Expected YYYY-MM-DD`);
	}

	const daysInMonth = new Date(year, month, 0).getDate();
	const randomDay =
		Math.floor(Math.random() * daysInMonth) + SEED_CONFIG.firstDayOfMonth;
	const invoiceDate = new Date(Date.UTC(year, month - 1, randomDay));

	return { invoiceDate, revenuePeriod };
}

/**
 * Build demo users with hashed passwords.
 */
export async function buildUserSeed(): Promise<ReadonlyArray<SeedUserRow>> {
	return Promise.all(
		seedUsers.map(async (user) => ({
			email: user.email,
			password: await hashPassword(user.password),
			role: user.role,
			username: user.username,
		})),
	);
}

/**
 * Build randomized invoice rows based on existing customers and available periods.
 */
export function buildRandomInvoiceRows(
	existingCustomers: ReadonlyArray<{ readonly id: string }>,
	availablePeriods: ReadonlyArray<string>,
): NewInvoice[] {
	if (existingCustomers.length === 0) {
		throw new Error("buildRandomInvoiceRows requires at least one customer");
	}
	if (availablePeriods.length === 0) {
		throw new Error("buildRandomInvoiceRows requires at least one period");
	}

	const invoiceRows: NewInvoice[] = [];
	for (let i = 0; i < SEED_CONFIG.invoiceCount; i++) {
		const customer = randomItem(existingCustomers);
		const period = randomItem(availablePeriods);

		if (!customer?.id) {
			throw new Error(`Invalid customer at index ${i}`);
		}
		if (!period) {
			throw new Error(`Invalid period at index ${i}`);
		}

		const { invoiceDate, revenuePeriod } = buildInvoiceDateForPeriod(period);

		invoiceRows.push({
			amount: generateInvoiceAmount(),
			customerId: toCustomerId(customer.id),
			date: invoiceDate,
			revenuePeriod,
			status: randomInvoiceStatus(),
		} as NewInvoice);
	}
	return invoiceRows;
}
