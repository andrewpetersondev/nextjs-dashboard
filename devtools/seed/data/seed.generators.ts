import type { invoices } from "@database/schema/invoices";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import type { Hash } from "@/server/crypto/hashing/hashing.value";
import {
	ADMIN_ROLE,
	GUEST_ROLE,
	USER_ROLE,
	type UserRole,
} from "@/shared/policies/user-role/user-role.constants";
import type { Period } from "@/shared/primitives/period/period.brand";
import { hashPassword } from "../../users/hash-password";
import { validatePeriod } from "../seed.periods";
import { SEED_CONFIG } from "./seed.constants";
import { type NewInvoice, periods } from "./seed.fixtures";

/**
 * Build demo users with hashed passwords.
 */
export async function buildUserSeed(): Promise<
	ReadonlyArray<{
		readonly email: string;
		readonly password: Hash;
		readonly role: UserRole;
		readonly username: string;
	}>
> {
	return [
		{
			email: "user@user.com",
			password: await hashPassword("UserPassword123!"),
			role: USER_ROLE,
			username: "user",
		},
		{
			email: "admin@admin.com",
			password: await hashPassword("AdminPassword123!"),
			role: ADMIN_ROLE,
			username: "admin",
		},
		{
			email: "guest@guest.com",
			password: await hashPassword("GuestPassword123!"),
			role: GUEST_ROLE,
			username: "guest",
		},
	] as const;
}

/**
 * Generate first-of-month periods as YYYY-MM-DD strings.
 */
export function generateMonthlyPeriods(
	start: string,
	months: number,
): string[] {
	if (!start) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}
	if (!months || months < 0) {
		throw new Error(
			`Invalid months count: ${months}. Must be a positive integer.`,
		);
	}
	const [yearStr, monthStr] = start.split("-");
	if (!(yearStr && monthStr)) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}
	const year = Number.parseInt(yearStr, 10);
	const month = Number.parseInt(monthStr, 10);
	if (Number.isNaN(year) || Number.isNaN(month)) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}

	const out: string[] = [];
	for (let i = 0; i < months; i++) {
		const currentYear =
			year + Math.floor((month - 1 + i) / SEED_CONFIG.monthsInYear);
		const currentMonth = ((month - 1 + i) % SEED_CONFIG.monthsInYear) + 1;
		const d = new Date(
			Date.UTC(currentYear, currentMonth - 1, SEED_CONFIG.firstDayOfMonth),
		);
		const iso = d.toISOString().slice(0, 10);
		out.push(iso);
	}
	return out;
}

export function generateInvoiceAmount(): number {
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

export function randomInvoiceStatus(): "pending" | "paid" {
	return Math.random() < SEED_CONFIG.invoiceStatusPendingProbability
		? "pending"
		: "paid";
}

/**
 * Build randomized invoice rows based on existing customers and generated periods.
 */
export function buildRandomInvoiceRows(
	existingCustomers: ReadonlyArray<{ readonly id: string }>,
): NewInvoice[] {
	const invoiceRows: NewInvoice[] = [];
	for (let i = 0; i < SEED_CONFIG.invoiceCount; i++) {
		const customer =
			existingCustomers[Math.floor(Math.random() * existingCustomers.length)];
		const period = periods[Math.floor(Math.random() * periods.length)];
		if (!customer?.id) {
			throw new Error(`Invalid customer at index ${i}`);
		}
		if (!period) {
			throw new Error(`Invalid period at index ${i}`);
		}
		validatePeriod(period);
		const revenuePeriod = new Date(`${period}T00:00:00.000Z`);
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

		invoiceRows.push({
			amount: generateInvoiceAmount(),
			customerId: toCustomerId(customer.id),
			date: invoiceDate,
			revenuePeriod: revenuePeriod as Period,
			status: randomInvoiceStatus(),
		} as typeof invoices.$inferInsert);
	}
	return invoiceRows;
}
