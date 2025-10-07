import "server-only";
import {
  CacheError,
  CryptoError,
  DatabaseError,
  InfrastructureError,
} from "@/server/errors/infrastructure";

export const isInfrastructureError = (e: unknown): e is InfrastructureError =>
  e instanceof InfrastructureError;

export const isDatabaseError = (e: unknown): e is DatabaseError =>
  e instanceof DatabaseError;

export const isCacheError = (e: unknown): e is CacheError =>
  e instanceof CacheError;

export const isCryptoError = (e: unknown): e is CryptoError =>
  e instanceof CryptoError;
