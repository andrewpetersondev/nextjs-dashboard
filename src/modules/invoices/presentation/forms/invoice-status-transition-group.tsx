import type { JSX } from "react";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import { allowedNextInvoiceStatuses } from "@/modules/invoices/domain/statuses/invoice-status.transitions";
import { InvoiceStatusComponent } from "@/modules/invoices/presentation/components/tables/status";
import { ButtonAtom } from "@/ui/atoms/button.atom";
import { InputFieldCardWrapper } from "@/ui/wrappers/input-field-card.wrapper";

const TRANSITION_LABELS: Partial<Record<InvoiceStatus, string>> = {
	paid: "Mark as paid",
	void: "Void invoice",
};

/**
 * Replaces the free status radio on the EDIT form: status is changed only
 * through explicit transitions allowed by the domain matrix. Each button is a
 * submitter carrying `name="status" value={target}` — the browser includes the
 * clicked submitter's pair in the FormData, so the existing update action and
 * partial schema work unchanged, with no client-side status state.
 * Terminal statuses (paid, void) offer no transitions.
 */
export const InvoiceStatusTransitionGroup = ({
	current,
	disabled = false,
}: {
	current: InvoiceStatus;
	disabled?: boolean;
}): JSX.Element => {
	const targets = allowedNextInvoiceStatuses(current);

	return (
		<InputFieldCardWrapper>
			<fieldset data-cy="invoice-status-transition-group">
				<legend className="mb-2 block font-medium text-sm">
					Invoice status
				</legend>
				<div className="flex flex-wrap items-center gap-3 rounded-md border border-bg-accent px-3.5 py-3">
					<InvoiceStatusComponent status={current} />
					{targets.length === 0 ? (
						<p className="text-sm text-text-secondary">
							This invoice is {current} — its details are locked.
						</p>
					) : (
						targets.map(
							(target): JSX.Element => (
								<ButtonAtom
									data-cy={`invoice-transition-${target}`}
									disabled={disabled}
									key={target}
									name="status"
									size="sm"
									type="submit"
									value={target}
									variant={target === "void" ? "danger" : "secondary"}
								>
									{TRANSITION_LABELS[target] ?? target}
								</ButtonAtom>
							),
						)
					)}
				</div>
			</fieldset>
		</InputFieldCardWrapper>
	);
};
