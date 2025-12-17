/** biome-ignore-all lint/style/useNamingConvention: <bad rule> */

export const CONDITIONS = {
  db_check_violation: "db_check_violation",
  db_exclusion_violation: "db_exclusion_violation",
  db_foreign_key_violation: "db_foreign_key_violation",
  db_not_null_violation: "db_not_null_violation",
  db_unique_violation: "db_unique_violation",
  db_unknown_error: "db_unknown_error",
} as const;

export type ConditionKey = keyof typeof CONDITIONS;
export type Condition = (typeof CONDITIONS)[ConditionKey];
