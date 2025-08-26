// Client-safe time helpers
export const nowMs = (): number => Date.now();

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (expiresAtMs: number): boolean =>
  nowMs() > expiresAtMs;
