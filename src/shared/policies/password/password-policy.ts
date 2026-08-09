/**
 * Shortest accepted password.
 *
 * Consumed only by `password.schema.ts`; import that schema rather than
 * checking these rules yourself. The three regexes below are additive — a
 * password must satisfy every one, not any one.
 */
export const PASSWORD_MIN_LENGTH = 5;

/** Shown when {@link PASSWORD_MIN_LENGTH} is not met. */
export const PASSWORD_MIN_LENGTH_ERROR =
	"Password must be at least 5 characters long.";

/**
 * Longest accepted password.
 *
 * A cap on the plaintext only; the stored value is a fixed-width hash, so this
 * is not a storage constraint.
 */
export const PASSWORD_MAX_LENGTH = 20;

/** Shown when {@link PASSWORD_MAX_LENGTH} is exceeded. */
export const PASSWORD_MAX_LENGTH_ERROR =
	"Password must be at most 20 characters long.";

/** Requires at least one ASCII letter; accented and non-Latin letters do not count. */
export const PASSWORD_RULE_REGEX_CONTAIN_LETTER = /[a-zA-Z]/;

/** Shown when {@link PASSWORD_RULE_REGEX_CONTAIN_LETTER} does not match. */
export const PASSWORD_RULE_REGEX_ERROR_LETTER =
	"Password must contain at least one letter.";

/** Requires at least one digit. */
export const PASSWORD_RULE_REGEX_CONTAIN_NUMBER = /[0-9]/;

/** Shown when {@link PASSWORD_RULE_REGEX_CONTAIN_NUMBER} does not match. */
export const PASSWORD_RULE_REGEX_ERROR_NUMBER =
	"Password must contain at least one number.";

/**
 * Requires one character from this fixed set. Symbols outside it — `-`, `_`,
 * `+`, `=`, `[`, `]`, `/`, `\`, `;`, `'`, `~`, backtick — do not satisfy the rule.
 */
export const PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER =
	/[!@#$%^&*(),.?":{}|<>]/;

/** Shown when {@link PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER} does not match. */
export const PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER =
	"Password must contain at least one special character.";
