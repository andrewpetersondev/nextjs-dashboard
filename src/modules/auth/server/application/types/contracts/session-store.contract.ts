import "server-only";

export interface SessionStoreContract {
  delete(): Promise<void>;
  get(): Promise<string | undefined>;
  set(value: string, expiresAtMs: number): Promise<void>;
}
