/**
 * Add a “composition root” inside the auth module (recommended)
 * Right now, each action wires dependencies independently (DB + factories + logger + request id). That tends to sprawl.
 * Create a single place that builds auth workflows/use-cases for the request, e.g.:
 * •
 * src/modules/auth/infrastructure/composition/auth.composition.ts (or presentation/_composition/auth.composition.ts)
 * Responsibilities:
 * •
 * fetch DB connection (or accept it)
 * •
 * create logger + requestId
 * •
 * create use cases via *UseCaseFactory
 * •
 * create session services (sessionServiceFactory)
 */

import "server-only";
import type { CreateDemoUserRequestDto } from "@/modules/auth/application/authn/schemas/create-demo-user-request.schema";
import type { LoginRequestDto } from "@/modules/auth/application/authn/schemas/login-request.schema";
import type { SignupRequestDto } from "@/modules/auth/application/authn/schemas/signup-request.schema";
import { createDemoUserWorkflow } from "@/modules/auth/application/authn/workflows/create-demo-user.workflow";
import { loginWorkflow } from "@/modules/auth/application/authn/workflows/login.workflow";
import { signupWorkflow } from "@/modules/auth/application/authn/workflows/signup.workflow";
import { authUnitOfWorkFactory } from "@/modules/auth/infrastructure/persistence/auth-user/factories/auth-unit-of-work.factory";
import { demoUserUseCaseFactory } from "@/modules/auth/infrastructure/persistence/auth-user/factories/demo-user-use-case.factory";
import { loginUseCaseFactory } from "@/modules/auth/infrastructure/persistence/auth-user/factories/login-use-case.factory";
import { signupUseCaseFactory } from "@/modules/auth/infrastructure/persistence/auth-user/factories/signup-use-case.factory";
import { sessionServiceFactory } from "@/modules/auth/infrastructure/session/session-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

export type AuthComposition = Readonly<{
  request: Readonly<{
    requestId: string;
    logger: LoggingClientContract;
    ip: string | null;
    userAgent: string | null;
  }>;

  workflows: Readonly<{
    login(input: Readonly<LoginRequestDto>): ReturnType<typeof loginWorkflow>;
    signup(
      input: Readonly<SignupRequestDto>,
    ): ReturnType<typeof signupWorkflow>;
    demoUser(
      input: Readonly<CreateDemoUserRequestDto>,
    ): ReturnType<typeof createDemoUserWorkflow>;
  }>;
}>;

/**
 * Composition root for the auth module.
 *
 * - Creates a per-request `requestId`
 * - Scopes the logger (`auth:composition` + request + ip/userAgent)
 * - Wires DB-backed use cases via factories
 * - Wires the cookie/JWT session service via `sessionServiceFactory`
 * - Exposes high-level workflows ready for server actions
 */
export async function makeAuthComposition(
  overrides?: Readonly<{
    requestId?: string;
    logger?: LoggingClientContract;
  }>,
): Promise<AuthComposition> {
  const requestId = overrides?.requestId ?? crypto.randomUUID();

  const { ip, userAgent } = await getRequestMetadata();

  const baseLogger = (overrides?.logger ?? defaultLogger)
    .withContext("auth:composition")
    .withRequest(requestId)
    .child({ ip, userAgent });

  const db = getAppDb();

  // Session service (cookie store + token service wired internally)
  const sessionService = sessionServiceFactory(baseLogger, requestId);

  // Authn use cases
  const loginUseCase = loginUseCaseFactory(db, baseLogger, requestId);

  // Transactional flows use a UoW
  const uow = authUnitOfWorkFactory(db, baseLogger, requestId);
  const signupUseCase = signupUseCaseFactory(uow, baseLogger);
  const demoUserUseCase = demoUserUseCaseFactory(uow, baseLogger);

  return {
    request: {
      ip,
      logger: baseLogger,
      requestId,
      userAgent,
    },
    workflows: {
      demoUser: (input) =>
        createDemoUserWorkflow(input, {
          demoUserUseCase,
          sessionService,
        }),
      login: (input) => loginWorkflow(input, { loginUseCase, sessionService }),
      signup: (input) =>
        signupWorkflow(input, { sessionService, signupUseCase }),
    },
  } as const;
}
