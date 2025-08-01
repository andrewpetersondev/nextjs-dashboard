import "server-only";

import type {
  InvoiceEntity,
  InvoiceFormEntity,
} from "@/db/models/invoice.entity";
import type { InvoiceRow } from "@/db/schema";
import type {
  InvoiceDto,
  InvoiceDto_v2,
  InvoiceFormDto,
} from "@/features/invoices/invoice.dto";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatus,
} from "@/lib/definitions/brands";

/**
 * Maps raw database row to branded Entity.
 */
export function rawDbToInvoiceEntity(row: InvoiceRow): InvoiceEntity {
  return {
    amount: row.amount,
    customerId: toCustomerId(row.customerId),
    date: row.date,
    id: toInvoiceId(row.id),
    sensitiveData: row.sensitiveData,
    status: toInvoiceStatus(row.status),
  };
}

/**
 * Maps branded Entity to plain DTO.
 * Strips ALL branding for service/API layer.
 */
export function entityToInvoiceDto(entity: InvoiceEntity): InvoiceDto {
  return {
    amount: entity.amount, // store in cents
    customerId: String(entity.customerId), // Strip branding
    date: entity.date,
    id: String(entity.id), // Strip branding
    sensitiveData: entity.sensitiveData,
    status: entity.status, // InvoiceStatus is not branded
  };
}

/**
 * Maps branded Entity to plain DTO.
 * Strips ALL branding for service/API layer.
 * @param entity - The invoice entity to map
 * @param includeSensitive - Whether to include sensitive data (default: false)
 */
export function entityToInvoiceDto_v2(
  entity: InvoiceEntity,
  includeSensitive: boolean = false,
): InvoiceDto_v2 {
  const baseDto = {
    amount: entity.amount,
    customerId: String(entity.customerId),
    date: entity.date,
    id: String(entity.id),
    status: entity.status,
  };

  if (includeSensitive) {
    return {
      ...baseDto,
      sensitiveData: entity.sensitiveData,
    } as InvoiceDto_v2 & { sensitiveData: string };
  }

  return baseDto;
}

/**
 * Maps plain InvoiceFormDto to branded InvoiceFormEntity.
 * Applies branding for database layer.
 * @exclude
 * Excludes `id` since IDs are generated by the database.
 */
export function dtoToCreateInvoiceEntity(
  dto: InvoiceFormDto,
): InvoiceFormEntity {
  return {
    amount: dto.amount, // Already in cents from service layer
    customerId: toCustomerId(dto.customerId), // Apply branding
    date: dto.date,
    sensitiveData: dto.sensitiveData,
    status: toInvoiceStatus(dto.status), // Apply branding
  };
}

/**
 * Maps a partial InvoiceFormDto to a partial branded InvoiceFormEntity.
 * Ensures exact optional property types for strict TypeScript settings.
 * @param dto - Partial DTO from service layer
 * @returns Partial form entity for DAL
 */
export function partialDtoToCreateInvoiceEntity(
  dto: Partial<InvoiceFormDto>,
): Partial<InvoiceFormEntity> {
  return {
    ...(dto.amount !== undefined && { amount: dto.amount }),
    ...(dto.customerId !== undefined && {
      customerId: toCustomerId(dto.customerId),
    }),
    ...(dto.date !== undefined && { date: dto.date }),
    ...(dto.sensitiveData !== undefined && {
      sensitiveData: dto.sensitiveData,
    }),
    ...(dto.status !== undefined && { status: toInvoiceStatus(dto.status) }),
  };
}
