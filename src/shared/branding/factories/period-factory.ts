import { type Brand, createBrand } from "@/shared/branding/brand";
import { PERIOD_BRAND, type Period } from "@/shared/branding/brands";

import { periodValidator } from "@/shared/branding/validators/period-validator";
import { brandWith } from "@/shared/branding/validators/validator-combinators";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

/**
 * Generic factory for creating branded period validators (Result-based).
 */
export const createBrandedPeriodValidator = <
  B extends symbol,
  T extends Brand<Date, B>,
>(
  brandSymbol: B,
) => {
  const brandFn = createBrand<Date, B>(brandSymbol);
  const internalCreator = brandWith<Date, T>(
    periodValidator,
    ((value: Date) => brandFn(value) as T) as (value: Date) => T,
  );

  return (value: unknown): Result<T, AppError> => internalCreator(value);
};

export const createPeriod = createBrandedPeriodValidator<
  typeof PERIOD_BRAND,
  Period
>(PERIOD_BRAND);
