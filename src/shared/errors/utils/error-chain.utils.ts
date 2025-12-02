/**
 * BFS to flatten the error chain, looking into common wrapper properties.
 * Useful for finding the root cause or specific metadata in nested errors.
 */
export function flattenErrorChain(root: unknown): Record<string, unknown>[] {
  if (!root || typeof root !== "object") {
    return [];
  }

  const queue: Record<string, unknown>[] = [root as Record<string, unknown>];
  const result: Record<string, unknown>[] = [];
  const seen = new Set<object>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);
    result.push(current);

    // Check common wrapper properties
    // We use a predefined list to avoid infinite recursion on arbitrary props
    const propsToCheck = ["cause", "originalError", "originalCause", "error"];
    for (const prop of propsToCheck) {
      const val = current[prop];
      if (val && typeof val === "object") {
        queue.push(val as Record<string, unknown>);
      }
    }
  }
  return result;
}
