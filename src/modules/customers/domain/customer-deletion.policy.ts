/**
 * Whether a customer may be deleted, given how many invoices reference them.
 *
 * `blocked` carries the count so the caller can name it in the message — the
 * number is the whole point of the refusal, not decoration.
 */
export type CustomerDeletionDecision =
	| { readonly allowed: true }
	| { readonly allowed: false; readonly invoiceCount: number };

/**
 * Decides whether deleting a customer is permitted.
 *
 * This is a **policy decision returning a domain outcome value**, not an
 * `Err(AppError)` — a customer who still has invoices is an ordinary,
 * expected state, not a technical failure. That split is the rule in
 * `docs/standards/error-handling-and-result-pattern.md` under Failure
 * Classification.
 *
 * Extracted as a pure function, mirroring `classifyFreshness`, so the boundary
 * (exactly zero invoices) is pinned by unit tests instead of being buried in
 * the service's I/O path.
 *
 * @remarks
 * The guard exists because `invoices.customer_id` is declared
 * `ON DELETE CASCADE`. Postgres will happily delete a customer's invoices as a
 * side effect, which silently changes the dashboard's revenue aggregates. The
 * database's answer is "yes, and take the invoices with it"; the product's
 * answer is "no, say why".
 *
 * A negative count is treated as blocked rather than trusted: it can only come
 * from a corrupt or mocked source, and failing closed on a delete is the safe
 * direction.
 */
export function evaluateCustomerDeletion(
	invoiceCount: number,
): CustomerDeletionDecision {
	if (invoiceCount === 0) {
		return { allowed: true };
	}
	return { allowed: false, invoiceCount };
}
