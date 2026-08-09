import clsx from "clsx";
import Image from "next/image";
import type { JSX } from "react";
import { toInitials } from "@/shared/primitives/text/initials";

type AvatarSize = "md" | "sm";

/**
 * Pixel dimensions handed to `next/image`, which needs real numbers for its
 * `width`/`height` attributes.
 */
const AVATAR_PIXELS: Record<AvatarSize, number> = {
	md: 40,
	sm: 28,
};

/**
 * Tile geometry as **static Tailwind classes, never an inline `style`**.
 *
 * This is a CSP constraint, not a style preference. `security-headers.ts` grants
 * `style-src 'unsafe-inline'` **only in development**; production runs
 * `style-src 'self'`, which strips inline `style` attributes. An inline
 * `style={{ height, width }}` would therefore look perfect locally and render a
 * zero-sized tile on Vercel — the silent, screenshot-proof CSP failure this repo
 * has hit before.
 *
 * Every class here is on Tailwind's **standard scale** (`h-7` = 28px,
 * `h-10` = 40px, `text-xs` = 12px). That is deliberate: an arbitrary value like
 * `h-[30px]` only reaches the stylesheet if Tailwind's scanner finds that exact
 * literal, so it fails as a *missing rule* — the class sits in the markup, the
 * element renders 0×0, and nothing errors. Sticking to the standard scale
 * removes that failure mode rather than relying on the scanner.
 */
const AVATAR_TILE_CLASSES: Record<AvatarSize, string> = {
	md: "h-10 w-10 text-base",
	sm: "h-7 w-7 text-xs",
};

interface AvatarMoleculeProps {
	readonly className?: string;
	readonly imageUrl: string;
	readonly name: string;
	readonly priority?: boolean;
	readonly size?: AvatarSize;
}

/**
 * A named entity's avatar: the stored image when there is one, initials when
 * not.
 *
 * @remarks
 * **Every customer avatar in the app must go through this component.**
 * Customers created in-app have no image file — `customers.image_url` is
 * `NOT NULL`, so "no image" is stored as the empty string — and passing `""`
 * straight to `next/image` makes React warn that the browser may re-download
 * the whole page as the `src`. That is not hypothetical: the customer create
 * form shipped before the three invoice components that render a customer's
 * avatar were updated, and the dashboard overview logged that warning for every
 * invoice belonging to an in-app customer.
 *
 * `next/image` is configured with no `remotePatterns`, so it can only serve
 * files under `public/` — "no image" is therefore rendered, never fetched.
 *
 * The initials tile uses the same semantic tokens as the surrounding surface
 * rather than a generated per-entity color: a generated palette would need its
 * contrast re-verified against both schemes, and the axe checks in the smoke
 * spec block on moderate-impact violations.
 *
 * `aria-hidden` on the tile is deliberate — every caller renders the name
 * beside it, so announcing "AB" first would make screen reader users hear the
 * name twice.
 */
export function AvatarMolecule({
	className,
	imageUrl,
	name,
	priority = false,
	size = "sm",
}: AvatarMoleculeProps): JSX.Element {
	if (imageUrl) {
		return (
			<Image
				alt={`${name}'s profile picture`}
				className={clsx("rounded-full", className)}
				height={AVATAR_PIXELS[size]}
				priority={priority}
				src={imageUrl}
				width={AVATAR_PIXELS[size]}
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			className={clsx(
				"flex shrink-0 items-center justify-center rounded-full bg-bg-secondary font-medium text-text-primary",
				AVATAR_TILE_CLASSES[size],
				className,
			)}
			data-cy="initials-avatar"
		>
			{toInitials(name)}
		</span>
	);
}
