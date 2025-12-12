export function isPositiveNumber(
  counter: number | null | undefined,
): counter is number {
  return typeof counter === "number" && counter > 0;
}
