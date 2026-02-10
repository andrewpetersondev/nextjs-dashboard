import { headers } from "next/headers";

/**
 * Top-level, reusable regex for parsing the `Forwarded` header.
 *
 * The pattern is case-insensitive and captures the value of the `for=` token
 * from a single `Forwarded` entry. It supports:
 * - IPv4 addresses (e.g. `192.0.2.43`)
 * - IPv6 addresses, optionally enclosed in brackets (e.g. `[2001:db8::1]`)
 * - Obfuscated identifiers (e.g. `_hidden`)
 *
 * Capturing group 1 contains the `for` value without surrounding quotes.
 *
 * @example
 * const match = FORWARDED_FOR_REGEX.exec('for="192.0.2.43; proto=http; by=203.0.113.43"');
 * // match?.[1] === '192.0.2.43'
 *
 * @constant
 */
const FORWARDED_FOR_REGEX: RegExp = /for="?(\[?[^;\],"]+]?)/i;

/**
 * Retrieve the first comma-separated value for a header from a Headers list.
 *
 * Looks up the header by `name`, splits the raw header value on commas,
 * trims whitespace from the first segment and returns it. If the header
 * is missing or the resulting value is empty, returns the provided `fallback`.
 *
 * @param headersList - The request `Headers` object to read from.
 * @param name - The header name to retrieve (case-insensitive when provided by runtime).
 * @param fallback - Value to return when the header is absent or empty (default: `"unknown"`).
 * @returns The first header value or the `fallback`.
 *
 * @example
 * const ua = getHeaderValue(req.headers, "user-agent", "unknown");
 */
function getHeaderValue(
  headersList: Headers,
  name: string,
  fallback: string = "unknown",
): string {
  const raw = headersList.get(name) ?? "";
  const [first = ""] = raw.split(",");
  const value = first.trim();
  return value === "" ? fallback : value;
}

/**
 * Extract the `for` token value from a `Forwarded` header entry.
 *
 * Parses the first comma-separated entry of the `Forwarded` header and returns the value from the
 * `for=` parameter. Handles IPv4, IPv6 (possibly bracketed), and obfuscated identifiers.
 * Returns `null` when no `for` value is present.
 *
 * @param forwardedValue - The raw `Forwarded` header string (may contain multiple comma-separated entries).
 * @returns The extracted IP or identifier string, or `null` if none found.
 *
 * @example
 * // forwardedValue: "for=192.0.2.43; proto=http; by=203.0.113.43"
 * // returns: "192.0.2.43"
 */
function extractIpFromForwarded(forwardedValue: string): string | null {
  const [entry = ""] = forwardedValue.split(",");
  const match = FORWARDED_FOR_REGEX.exec(entry);
  return match?.[1] ?? null;
}

/**
 * Determine the first client IP from known headers in order of precedence:
 * 1. `Forwarded` (parsed `for=` token)
 * 2. `X-Forwarded-For` (first comma-separated value)
 * 3. `X-Real-IP`
 *
 * If none of the headers provide a value, returns `"unknown"`.
 *
 * @param headersList - The request `Headers` object to inspect.
 * @returns A single IP/identifier string or `"unknown"`.
 *
 * @internal
 */
function getFirstIp(headersList: Headers): string {
  const forwarded = getHeaderValue(headersList, "forwarded", "");
  if (forwarded) {
    const ip = extractIpFromForwarded(forwarded);
    if (ip !== null && ip.trim() !== "") {
      return ip.trim();
    }
  }

  const xff = getHeaderValue(headersList, "x-forwarded-for", "");
  if (xff) {
    return xff;
  }

  const realIp = getHeaderValue(headersList, "x-real-ip", "");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Retrieve request-level metadata useful for logging and audit contexts.
 *
 * This function reads the runtime request headers and returns a small object
 * containing:
 * - `ip`: best-effort client IP derived from `Forwarded`, `X-Forwarded-For`, or `X-Real-IP`.
 * - `userAgent`: value of the `User-Agent` header or `"unknown"` when absent.
 *
 * @returns A promise resolving to an object with `ip` and `userAgent` properties.
 *
 * @example
 * const { ip, userAgent } = await getRequestMetadata();
 */
export async function getRequestMetadata(): Promise<{
  ip: string;
  userAgent: string;
}> {
  const headersList = await headers();
  return {
    ip: getFirstIp(headersList),
    userAgent: getHeaderValue(headersList, "user-agent", "unknown"),
  };
}
