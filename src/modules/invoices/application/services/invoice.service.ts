import "server-only";

import type {
	InvoiceDto,
	InvoiceFormDto,
	InvoicesSummary,
} from "@/modules/invoices/application/dto/invoice.dto";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { toInvoiceId } from "@/modules/invoices/domain/invoice-id.mappers";
import type { RevenuePeriodTotals } from "@/modules/invoices/domain/revenue/revenue.types";
import {
	fillRevenuePeriodGaps,
	revenueWindowStart,
} from "@/modules/invoices/domain/revenue/revenue-window";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import { overdueIssueDateCutoff } from "@/modules/invoices/domain/statuses/invoice-status.display";
import {
	DEFAULT_INVOICE_STATUS_FILTER,
	type InvoiceStatusFilter,
} from "@/modules/invoices/domain/statuses/invoice-status.filter";
import { validateInvoiceStatusTransition } from "@/modules/invoices/domain/statuses/invoice-status.transitions";
import {
	dtoToCreateInvoiceEntity,
	partialDtoToCreateInvoiceEntity,
} from "@/modules/invoices/infrastructure/adapters/codecs/invoice-codecs";
import { invoiceFormEntityToServiceEntity } from "@/modules/invoices/infrastructure/adapters/mappers/invoice.mapper";
import type { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import { CENTS_IN_DOLLAR } from "@/shared/primitives/money/money.constants";

export class InvoiceService {
	private readonly repo: InvoiceRepository;

	constructor(repo: InvoiceRepository) {
		this.repo = repo;
	}

	private dollarsToCents(dollars: number): number {
		return Math.round(dollars * CENTS_IN_DOLLAR);
	}

	private validateAndFormatDate(date: string): Result<string, AppError> {
		const parsed = new Date(date);
		if (Number.isNaN(parsed.getTime())) {
			return Err(
				makeAppError("validation", {
					cause: "",
					message: INVOICE_MSG.invalidFormData,
					metadata: {},
				}),
			);
		}
		return Ok(date);
	}

	private applyBusinessRules(
		dto: InvoiceFormDto,
	): Result<InvoiceFormDto, AppError> {
		const dateResult = this.validateAndFormatDate(dto.date);
		if (!dateResult.ok) {
			return Err(dateResult.error);
		}

		return Ok({
			amount: this.dollarsToCents(dto.amount),
			customerId: dto.customerId,
			date: dateResult.value,
			sensitiveData: dto.sensitiveData,
			status: dto.status,
		});
	}

	/**
	 * Transition guard, half 1 of 2: reads the current row and checks the domain
	 * matrix, returning the expectedStatus precondition for the repo (half 2 is
	 * the atomic WHERE in the DAL). Resolves to undefined when no real status
	 * change is requested, so plain field edits never carry a precondition.
	 */
	private async resolveExpectedStatus(
		id: string,
		nextStatus: InvoiceStatus | undefined,
	): Promise<Result<InvoiceStatus | undefined, AppError>> {
		if (nextStatus === undefined) {
			return Ok(undefined);
		}
		const current = await this.repo.read(toInvoiceId(id));
		const transition = validateInvoiceStatusTransition(
			current.status,
			nextStatus,
		);
		if (!transition.ok) {
			return Err(transition.error);
		}
		return Ok(current.status === nextStatus ? undefined : current.status);
	}

	async createInvoice(
		dto: InvoiceFormDto,
	): Promise<Result<InvoiceDto, AppError>> {
		const transformedDtoResult = this.applyBusinessRules(dto);
		if (!transformedDtoResult.ok) {
			return Err(transformedDtoResult.error);
		}

		const formEntityResult = dtoToCreateInvoiceEntity(
			transformedDtoResult.value,
		);
		if (!formEntityResult.ok) {
			return Err(formEntityResult.error);
		}

		const serviceEntityResult = invoiceFormEntityToServiceEntity(
			formEntityResult.value,
		);
		if (!serviceEntityResult.ok) {
			return Err(serviceEntityResult.error);
		}

		return Ok(await this.repo.create(serviceEntityResult.value));
	}

	async readInvoice(id: string): Promise<Result<InvoiceDto, AppError>> {
		if (!id) {
			return Err(
				makeAppError("validation", {
					cause: "",
					message: INVOICE_MSG.invalidId,
					metadata: {},
				}),
			);
		}
		return Ok(await this.repo.read(toInvoiceId(id)));
	}

	async updateInvoice(
		id: string,
		dto: Partial<InvoiceFormDto>,
	): Promise<Result<InvoiceDto, AppError>> {
		if (!(id && dto)) {
			return Err(
				makeAppError("validation", {
					cause: "",
					message: INVOICE_MSG.invalidInput,
					metadata: {},
				}),
			);
		}

		let dateResult: Result<string, AppError> = Ok(dto.date ?? "");
		let dateValue: string | undefined;
		if (dto.date !== undefined) {
			dateResult = this.validateAndFormatDate(dto.date);
			if (!dateResult.ok) {
				return Err(dateResult.error);
			}
			dateValue = dateResult.value;
		}

		const updateDto: Partial<InvoiceFormDto> = {
			...(dto.amount !== undefined && {
				amount: this.dollarsToCents(dto.amount),
			}),
			...(dto.customerId !== undefined && { customerId: dto.customerId }),
			...(dateValue !== undefined && { date: dateValue }),
			...(dto.sensitiveData !== undefined && {
				sensitiveData: dto.sensitiveData,
			}),
			...(dto.status !== undefined && { status: dto.status }),
		};

		const expectedStatusResult = await this.resolveExpectedStatus(
			id,
			updateDto.status,
		);
		if (!expectedStatusResult.ok) {
			return Err(expectedStatusResult.error);
		}

		const entityResult = partialDtoToCreateInvoiceEntity(updateDto);
		if (!entityResult.ok) {
			return Err(entityResult.error);
		}

		return Ok(
			await this.repo.update(
				toInvoiceId(id),
				entityResult.value,
				expectedStatusResult.value,
			),
		);
	}

	async deleteInvoice(id: string): Promise<Result<InvoiceDto, AppError>> {
		if (!id) {
			return Err(
				makeAppError("validation", {
					cause: "",
					message: INVOICE_MSG.invalidId,
					metadata: {},
				}),
			);
		}
		return Ok(await this.repo.delete(toInvoiceId(id)));
	}

	async readFilteredInvoices(
		query: string,
		currentPage: number,
		statusFilter: InvoiceStatusFilter = DEFAULT_INVOICE_STATUS_FILTER,
	): Promise<Result<InvoiceListFilter[], AppError>> {
		// Cutoff computed HERE from the domain's NET-terms constant and bound as a
		// query parameter — SQL never re-encodes the overdue rule.
		const overdueCutoff = overdueIssueDateCutoff(new Date());
		return Ok(
			await this.repo.readFiltered(
				query,
				currentPage,
				statusFilter,
				overdueCutoff,
			),
		);
	}

	async readInvoicesPages(
		query: string,
		statusFilter: InvoiceStatusFilter = DEFAULT_INVOICE_STATUS_FILTER,
	): Promise<Result<number, AppError>> {
		const overdueCutoff = overdueIssueDateCutoff(new Date());
		return Ok(
			await this.repo.readPagesCount(query, statusFilter, overdueCutoff),
		);
	}

	async readLatestInvoices(
		limit: number,
	): Promise<Result<InvoiceListFilter[], AppError>> {
		return Ok(await this.repo.readLatest(limit));
	}

	async readInvoicesSummary(): Promise<Result<InvoicesSummary, AppError>> {
		return Ok(await this.repo.readSummary());
	}

	/**
	 * Monthly revenue for the overview chart, split into paid / pending /
	 * overdue and padded to a complete window.
	 *
	 * @remarks
	 * `now` is read **once** and used for both the overdue cutoff and the window
	 * bounds. Two `new Date()` calls would almost always agree, and would
	 * disagree exactly at a month boundary — producing a window whose newest
	 * month is classified against a cutoff from the previous one. Rare, silent,
	 * and impossible to reproduce; cheaper to make unrepresentable.
	 */
	async readRevenueByPeriod(): Promise<
		Result<readonly RevenuePeriodTotals[], AppError>
	> {
		const now = new Date();
		const rows = await this.repo.readRevenueByPeriod(
			revenueWindowStart(now),
			overdueIssueDateCutoff(now),
		);

		// The query returns only months that have invoices; pad the gaps so the
		// axis represents time continuously.
		return Ok(fillRevenuePeriodGaps(rows, now));
	}
}
