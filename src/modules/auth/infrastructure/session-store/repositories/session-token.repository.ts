import "server-only";

import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";

/**
 * Repository for session token persistence.
 * Abstracts cookie operations from the application layer.
 */
export class SessionTokenRepository implements SessionStoreContract {
  private readonly adapter: SessionStoreContract;

  constructor(adapter: SessionStoreContract) {
    this.adapter = adapter;
  }

  get(): Promise<string | undefined> {
    return this.adapter.get();
  }

  async set(token: string, expiresAtMs: number): Promise<void> {
    await this.adapter.set(token, expiresAtMs);
  }

  async delete(): Promise<void> {
    await this.adapter.delete();
  }
}

/**
 * Factory function for creating SessionTokenRepository instances.
 */
export function createSessionTokenRepository(
  adapter: SessionStoreContract,
): SessionTokenRepository {
  return new SessionTokenRepository(adapter);
}
