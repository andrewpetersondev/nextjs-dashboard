import { headers } from "next/headers";

// Top-level, reused regex for `Forwarded` header parsing (case-insensitive)
const FORWARDED_FOR_REGEX: RegExp = /for="?(\[?[^;\],"]+]?)/i;

function getHeaderValue(
  headersList: Headers,
  name: string,
  fallback = "unknown",
): string {
  const raw = headersList.get(name) ?? "";
  const [first = ""] = raw.split(",");
  const value = first.trim();
  return value === "" ? fallback : value;
}

function extractIpFromForwarded(forwardedValue: string): string | null {
  // Example: for=192.0.2.43; proto=http; by=203.0.113.43
  const [entry = ""] = forwardedValue.split(",");
  const match = FORWARDED_FOR_REGEX.exec(entry);
  return match?.[1] ?? null;
}

function getFirstIp(headersList: Headers): string {
  const forwarded = getHeaderValue(headersList, "forwarded", "");
  if (forwarded) {
    const ip = extractIpFromForwarded(forwarded);
    if (ip && ip.trim() !== "") {
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
