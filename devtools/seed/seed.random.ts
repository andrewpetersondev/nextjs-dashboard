// biome-ignore-all lint/suspicious/noBitwiseOperators: mulberry32 is defined in terms of bitwise mixing; rewriting it without them would not be the same algorithm

const MULBERRY_INCREMENT = 0x6d_2b_79_f5;
const SHIFT_A = 15;
const SHIFT_B = 7;
const SHIFT_C = 14;
const ODD_MASK = 1;
const MIX_CONSTANT = 61;
const UINT32_RANGE = 4_294_967_296;

/**
 * A small, seedable PRNG (mulberry32).
 *
 * @remarks
 * The seed exists so that **reseeding produces identical data**. That is not
 * tidiness — `Math.random()` cost real reliability twice over:
 *
 * - The demo changed shape on every `db:seed`, so nothing about it could be
 *   rehearsed, screenshotted or quoted in docs with any confidence.
 * - The e2e suite depends on the overdue bucket being non-empty
 *   (`status-lifecycle.cy.ts` opens the first overdue invoice to exercise both
 *   transitions). With random statuses that held *by luck*, and a run where it
 *   did not would fail three tests with no code change to blame.
 *
 * Not cryptographic, and used for nothing but fixture generation.
 */
export function createSeededRandom(seed: number): () => number {
	let state = seed >>> 0;

	return (): number => {
		state = (state + MULBERRY_INCREMENT) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> SHIFT_A), ODD_MASK | t);
		t ^= t + Math.imul(t ^ (t >>> SHIFT_B), MIX_CONSTANT | t);
		return ((t ^ (t >>> SHIFT_C)) >>> 0) / UINT32_RANGE;
	};
}

/** Integer in `[min, max]`, drawn from the supplied generator. */
export function randomIntBetween(
	random: () => number,
	min: number,
	max: number,
): number {
	return min + Math.floor(random() * (max - min + 1));
}

/** Picks one item deterministically from a non-empty list. */
export function pickItem<T>(random: () => number, items: readonly T[]): T {
	const item = items.at(Math.floor(random() * items.length));

	if (item === undefined) {
		throw new Error("pickItem requires a non-empty list");
	}

	return item;
}
