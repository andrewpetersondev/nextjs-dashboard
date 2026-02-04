export function getNextRedirectPath(error: unknown): string | null {
  if (error instanceof Error && error.message === "NEXT_REDIRECT") {
    // The path is embedded in the digest in your mock implementation.
    // We keep this intentionally loose but *typed*.
    const maybeDigest = (error as { digest?: unknown }).digest;
    if (typeof maybeDigest === "string") {
      const parts = maybeDigest.split(";");
      return parts.length >= 2 ? parts.slice(1).join(";") : null;
    }
    return null;
  }
  return null;
}

export async function runAndCaptureRedirectPath(
  action: Promise<unknown>,
): Promise<string> {
  try {
    await action;
  } catch (error) {
    const path = getNextRedirectPath(error);
    if (path) {
      return path;
    }
    throw error;
  }
  throw new Error("Expected NEXT_REDIRECT to be thrown");
}
