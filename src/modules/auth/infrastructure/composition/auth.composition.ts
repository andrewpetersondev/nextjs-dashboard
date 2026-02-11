import "server-only";
import type { CreateDemoUserCommand } from "@/modules/auth/application/auth-user/dtos/requests/create-demo-user.command";
import type { LoginCommand } from "@/modules/auth/application/auth-user/dtos/requests/login.command";
import type { SignupCommand } from "@/modules/auth/application/auth-user/dtos/requests/signup.command";
import { createDemoUserWorkflow } from "@/modules/auth/application/auth-user/workflows/create-demo-user.workflow";
import { loginWorkflow } from "@/modules/auth/application/auth-user/workflows/login.workflow";
import { signupWorkflow } from "@/modules/auth/application/auth-user/workflows/signup.workflow";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import { logoutWorkflow } from "@/modules/auth/application/session/workflows/logout.workflow";
import { authUnitOfWorkFactory } from "@/modules/auth/infrastructure/composition/factories/auth-user/auth-unit-of-work.factory";
import { demoUserUseCaseFactory } from "@/modules/auth/infrastructure/composition/factories/auth-user/demo-user-use-case.factory";
import { loginUseCaseFactory } from "@/modules/auth/infrastructure/composition/factories/auth-user/login-use-case.factory";
import { signupUseCaseFactory } from "@/modules/auth/infrastructure/composition/factories/auth-user/signup-use-case.factory";
import { sessionServiceFactory } from "@/modules/auth/infrastructure/composition/factories/session/session-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";
import { logger as defaultLogger } from "@/shared/telemetry/logging/infrastructure/logging.client";

type AuthCompositionOverrides = Readonly<{
  logger: LoggingClientContract;
  requestId: string;
}>;

async function makeAuthCompositionInternal(
  overrides?: AuthCompositionOverrides,
): Promise<AuthComposition> {
  const requestId = overrides ? overrides.requestId : crypto.randomUUID();

  const { ip, userAgent } = await getRequestMetadata();

  const baseLogger = (overrides ? overrides.logger : defaultLogger)
    .withContext("auth:composition")
    .withRequest(requestId)
    .child({ ip, userAgent });

  const actionLogger = baseLogger.withContext("auth:action");

  const db = getAppDb();

  const sessionService = sessionServiceFactory(baseLogger, requestId);

  const loginUseCase = loginUseCaseFactory(db, baseLogger, requestId);

  const uow = authUnitOfWorkFactory(db, baseLogger, requestId);

  const signupUseCase = signupUseCaseFactory(uow, baseLogger);

  const demoUserUseCase = demoUserUseCaseFactory(uow, baseLogger);

  return {
    loggers: {
      action: actionLogger,
      composition: baseLogger,
    },
    request: {
      ip,
      logger: baseLogger,
      requestId,
      userAgent,
    },
    services: {
      sessionService,
    },
    workflows: {
      demoUser: (input: Readonly<CreateDemoUserCommand>) =>
        createDemoUserWorkflow(input, {
          demoUserUseCase,
          sessionService,
        }),
      login: (input: Readonly<LoginCommand>) =>
        loginWorkflow(input, { loginUseCase, sessionService }),
      logout: () => logoutWorkflow({ sessionService }),
      signup: (input: Readonly<SignupCommand>) =>
        signupWorkflow(input, { sessionService, signupUseCase }),
    },
  } as const;
}

export type AuthComposition = Readonly<{
  request: Readonly<{
    ip: string | null;
    logger: LoggingClientContract;
    requestId: string;
    userAgent: string | null;
  }>;

  loggers: Readonly<{
    action: LoggingClientContract;
    composition: LoggingClientContract;
  }>;

  services: Readonly<{
    sessionService: SessionServiceContract;
  }>;

  workflows: Readonly<{
    demoUser(
      input: Readonly<CreateDemoUserCommand>,
    ): ReturnType<typeof createDemoUserWorkflow>;
    login(input: Readonly<LoginCommand>): ReturnType<typeof loginWorkflow>;
    logout(): ReturnType<typeof logoutWorkflow>;
    signup(input: Readonly<SignupCommand>): ReturnType<typeof signupWorkflow>;
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
export async function makeAuthComposition(): Promise<AuthComposition> {
  return await makeAuthCompositionInternal();
}

/**
 * Testing-only escape hatch.
 *
 * Enforces "all-or-nothing" overrides (no optional props) to prevent drift.
 */
export async function makeAuthCompositionForTest(
  overrides: AuthCompositionOverrides,
): Promise<AuthComposition> {
  return await makeAuthCompositionInternal(overrides);
}
