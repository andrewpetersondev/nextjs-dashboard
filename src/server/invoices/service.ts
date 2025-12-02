import "server-only";
import type { InvoiceDto, InvoiceFormDto } from "@/features/invoices/lib/dto";
import { INVOICE_MSG } from "@/features/invoices/lib/i18n/invoice-messages";
import {
  dtoToCreateInvoiceEntity,
  partialDtoToCreateInvoiceEntity,
} from "@/server/invoices/invoice-codecs.server";
import { invoiceFormEntityToServiceEntity } from "@/server/invoices/mapper";
import type { InvoiceRepository } from "@/server/invoices/repo";
import { Err, Ok } from "@/shared/application/result/result";
import type { Result } from "@/shared/application/result/result.types";
import { toInvoiceId } from "@/shared/branding/converters/id-converters";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";
import { CENTS_IN_DOLLAR } from "@/shared/utilities/money/types";

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
        new AppError("validation", {
          message: INVOICE_MSG.invalidFormData,
          metadata: { date },
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

  async createInvoice(
    dto: InvoiceFormDto,
  ): Promise<Result<InvoiceDto, AppError>> {
    if (!dto) {
      return Err(
        new AppError("validation", {
          message: INVOICE_MSG.invalidInput,
        }),
      );
    }

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
        new AppError("validation", {
          message: INVOICE_MSG.invalidId,
          metadata: { id },
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
        new AppError("validation", {
          message: INVOICE_MSG.invalidInput,
          metadata: { hasDto: Boolean(dto), id },
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

    const entityResult = partialDtoToCreateInvoiceEntity(updateDto);
    if (!entityResult.ok) {
      return Err(entityResult.error);
    }

    return Ok(await this.repo.update(toInvoiceId(id), entityResult.value));
  }

  async deleteInvoice(id: string): Promise<Result<InvoiceDto, AppError>> {
    if (!id) {
      return Err(
        new AppError("validation", {
          message: INVOICE_MSG.invalidId,
          metadata: { id },
        }),
      );
    }
    return Ok(await this.repo.delete(toInvoiceId(id)));
  }
}
