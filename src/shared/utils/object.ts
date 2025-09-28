// Delete properties whose values match ANY of the given conditions
export const stripFalsyProperties = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>,
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, v]) =>
        v !== undefined && // Ignore undefined
        v !== null && // Ignore null
        v !== "" && // Ignore empty string
        v !== false, // Ignore boolean false
    ),
  );
};
