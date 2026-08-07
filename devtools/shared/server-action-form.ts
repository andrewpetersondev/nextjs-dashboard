/**
 * Submits a Next.js Server Action form the way a browser without JavaScript
 * would, from a plain Node script.
 *
 * WHY THIS EXISTS
 * A Server Action is not an HTTP endpoint you can POST to blind — the action's
 * id is generated at build time, so nothing outside the built app knows it. But
 * React 19 renders every server-action form for progressive enhancement, which
 * means the id travels IN THE MARKUP as hidden inputs:
 *
 *   $ACTION_REF_<n>     (empty marker)
 *   $ACTION_<n>:0       {"id":"<build-generated action id>","bound":"$@1"}
 *   $ACTION_<n>:1       bound arguments
 *   $ACTION_KEY         form key
 *
 * Replaying those fields plus the visible form fields dispatches the action.
 * That makes this a real end-to-end exercise of the no-JS path, with no browser
 * and no Cypress — which is what lets a scheduled watchdog log into production.
 *
 * FRAGILITY IS THE POINT. This parses HTML with regex, which would be a mistake
 * in application code. Here the markup comes from this repo's own components and
 * the caller is a guard: if React changes its encoding or the form disappears,
 * this throws a specific message rather than silently reporting success.
 */

const HIDDEN_INPUT_REGEX = /<input\b[^>]*type="hidden"[^>]*>/g;
const INPUT_NAME_REGEX = /\bname="([^"]*)"/;
const INPUT_VALUE_REGEX = /\bvalue="([^"]*)"/;
const SERVER_ACTION_FIELD_PREFIX = "$ACTION";

const HTML_ENTITIES: ReadonlyArray<readonly [RegExp, string]> = [
	[/&quot;/g, '"'],
	[/&#x27;/g, "'"],
	[/&#39;/g, "'"],
	[/&lt;/g, "<"],
	[/&gt;/g, ">"],
	[/&amp;/g, "&"],
];

function decodeHtmlEntities(value: string): string {
	return HTML_ENTITIES.reduce(
		(acc, [pattern, replacement]) => acc.replace(pattern, replacement),
		value,
	);
}

/**
 * Collects the `$ACTION_*` hidden inputs that make a no-JS submission dispatch.
 *
 * Module-private: callers want a submittable body, which is
 * {@link buildServerActionBody}. This is the step that produces the half of it
 * React owns.
 *
 * @throws If the form carries none — which means progressive enhancement is
 *   broken (no visitor without JavaScript could submit it) or React changed its
 *   encoding. Either way the caller must not report a passing login.
 */
function extractServerActionFields(form: string): Map<string, string> {
	const fields = new Map<string, string>();

	for (const input of form.match(HIDDEN_INPUT_REGEX) ?? []) {
		const name = INPUT_NAME_REGEX.exec(input)?.[1];

		if (name?.startsWith(SERVER_ACTION_FIELD_PREFIX)) {
			fields.set(
				name,
				decodeHtmlEntities(INPUT_VALUE_REGEX.exec(input)?.[1] ?? ""),
			);
		}
	}

	if (fields.size === 0) {
		throw new Error(
			"form carries no $ACTION_* hidden inputs — progressive enhancement is broken, or React changed its encoding",
		);
	}

	return fields;
}

/**
 * Isolates one `<form>` element by a marker string in its opening tag.
 *
 * @param html - A rendered HTML document.
 * @param marker - Something unique to the target form's opening tag, e.g.
 *   `data-cy="login-form"` or `aria-label="demo-user"`.
 * @throws If no form contains the marker.
 */
export function extractForm(html: string, marker: string): string {
	const form = html
		.split("<form")
		.slice(1)
		.map((chunk) => `<form${chunk.split("</form>")[0] ?? ""}`)
		.find((candidate) => candidate.includes(marker));

	if (!form) {
		throw new Error(
			`no <form> containing ${marker} — the page rendered, but the form is gone`,
		);
	}

	return form;
}

/**
 * Builds the multipart body for a server-action submission.
 *
 * @param form - The isolated form element, from {@link extractForm}.
 * @param userFields - The visible fields a user would fill in.
 */
export function buildServerActionBody(
	form: string,
	userFields: Readonly<Record<string, string>>,
): FormData {
	const formData = new FormData();

	for (const [name, value] of extractServerActionFields(form)) {
		formData.append(name, value);
	}
	for (const [name, value] of Object.entries(userFields)) {
		formData.append(name, value);
	}

	return formData;
}
