import "server-only";

import {
  CacheError_New,
  CryptoError_New,
  DatabaseError_New,
} from "@/server/errors/infrastructure";

export const isDatabaseError_New = (e: unknown): e is DatabaseError_New =>
  e instanceof DatabaseError_New;

export const isCacheError_New = (e: unknown): e is CacheError_New =>
  e instanceof CacheError_New;

export const isCryptoError_New = (e: unknown): e is CryptoError_New =>
  e instanceof CryptoError_New;
