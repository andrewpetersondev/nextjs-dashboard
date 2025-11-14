import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";

export const isDatabaseError = (e: unknown): e is DatabaseError =>
  e instanceof DatabaseError;
