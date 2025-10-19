import "server-only";
import {
  DatabaseError,
  InfrastructureError,
} from "@/server/errors/infrastructure-errors";

export const isInfrastructureError = (e: unknown): e is InfrastructureError =>
  e instanceof InfrastructureError;

export const isDatabaseError = (e: unknown): e is DatabaseError =>
  e instanceof DatabaseError;
