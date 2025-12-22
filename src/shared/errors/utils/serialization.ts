export function redactNonSerializable(value: unknown): unknown {
  if (value instanceof Error) {
    return { message: value.message, name: value.name };
  }

  // Fast path: value is JSON-serializable → return as-is
  try {
    JSON.stringify(value, (_key, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    return value;
  } catch {
    // Fall through to redaction below
  }

  let originalType: string;

  if (value === null) {
    originalType = "null";
  } else if (Array.isArray(value)) {
    originalType = "array";
  } else {
    originalType = typeof value;
  }

  let preview: string;
  try {
    preview = JSON.stringify(value);
  } catch {
    try {
      preview = String(value);
    } catch {
      preview = "[uninspectable value]";
    }
  }

  const MaxLength = 500;
  if (preview.length > MaxLength) {
    preview = `${preview.slice(0, MaxLength)}…[truncated ${
      preview.length - MaxLength
    } chars]`;
  }

  return {
    note: "non-serializable",
    originalType,
    preview,
  };
}
