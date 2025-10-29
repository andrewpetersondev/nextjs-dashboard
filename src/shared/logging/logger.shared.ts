/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import chalk from "chalk";
import { IS_PROD } from "@/shared/config/env-shared";

interface SharedLogger {
  debug(obj: unknown, msg?: string): void;
  debug(msg: string): void;
  info(obj: unknown, msg?: string): void;
  info(msg: string): void;
  warn(obj: unknown, msg?: string): void;
  warn(msg: string): void;
  error(obj: unknown, msg?: string): void;
  error(msg: string): void;
  child(bindings: Record<string, unknown>): SharedLogger;
}

/**
 * Create a console-based logger with bound context.
 * Each child merges additional bindings into the context.
 */
function makeLogger(context: Record<string, unknown> = {}): SharedLogger {
  const logger: SharedLogger = {
    child(bindings: Record<string, unknown>) {
      return makeLogger({ ...context, ...bindings });
    },

    debug(obj: unknown, msg?: string) {
      if (IS_PROD) {
        return;
      }
      if (typeof obj === "string" && msg === undefined) {
        console.debug(chalk.gray("[DEBUG]"), context, obj);
      } else {
        console.debug(chalk.gray("[DEBUG]"), context, obj, msg);
      }
    },

    error(obj: unknown, msg?: string) {
      if (typeof obj === "string" && msg === undefined) {
        console.error(chalk.red("[ERROR]"), context, obj);
      } else {
        console.error(chalk.red("[ERROR]"), context, obj, msg);
      }
    },

    info(obj: unknown, msg?: string) {
      if (typeof obj === "string" && msg === undefined) {
        console.info(chalk.blue("[INFO]"), context, obj);
      } else {
        console.info(chalk.blue("[INFO]"), context, obj, msg);
      }
    },

    warn(obj: unknown, msg?: string) {
      if (typeof obj === "string" && msg === undefined) {
        console.warn(chalk.yellow("[WARN]"), context, obj);
      } else {
        console.warn(chalk.yellow("[WARN]"), context, obj, msg);
      }
    },
  };

  return logger;
}

export const sharedLogger = makeLogger();

/**
 * Create a child logger with bound context fields.
 */
export function createChildLogger(
  bindings: Record<string, unknown>,
): SharedLogger {
  return sharedLogger.child(bindings);
}
