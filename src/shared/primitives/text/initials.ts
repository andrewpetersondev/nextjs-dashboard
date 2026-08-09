const MAX_INITIALS = 2;
const NO_NAME_INITIAL = "?";
const WHITESPACE_RUN = /\s+/u;

/**
 * Derives up to two display initials from a person's or company's name.
 *
 * "Amy Burns" → "AB", "Evil Rabbits Incorporated" → "EI" (first and last word,
 * since a middle word is rarely the distinguishing one), "Delba" → "D",
 * "" → "?".
 *
 * Iterates with `Array.from` rather than indexing, so a name starting with an
 * astral-plane character (an emoji, or scripts outside the BMP) yields that
 * whole character instead of half a surrogate pair — `"🦊 Fox"[0]` is a lone
 * high surrogate and renders as a replacement glyph.
 */
export function toInitials(name: string): string {
	const words = name.trim().split(WHITESPACE_RUN).filter(Boolean);

	if (words.length === 0) {
		return NO_NAME_INITIAL;
	}

	const firstWord = words[0] ?? "";
	const lastWord = words.at(-1) ?? "";

	// Cap the WORDS, never the joined string: each word contributes exactly one
	// code point below, but that code point can be two UTF-16 units wide, so a
	// trailing `.slice(0, 2)` on the result would cut an emoji in half — the
	// very bug `Array.from` is here to avoid.
	const picked = (
		words.length === 1 ? [firstWord] : [firstWord, lastWord]
	).slice(0, MAX_INITIALS);

	const initials = picked.map((word) => Array.from(word)[0] ?? "").join("");

	return initials.toUpperCase() || NO_NAME_INITIAL;
}
