import Image from "next/image";
import type { JSX } from "react";
import { toCustomerInitials } from "@/modules/customers/domain/customer-initials";
import { IMAGE_SIZES } from "@/ui/styles/images.tokens";

/**
 * Initials font size as a fraction of the tile diameter. Chosen so two
 * characters sit inside a 30px circle without touching the edge.
 */
const INITIALS_FONT_RATIO = 0.4;

interface CustomerAvatarProps {
	readonly imageUrl: string;
	readonly name: string;
	readonly size?: number;
}

/**
 * A customer's avatar: the stored image when there is one, initials when not.
 *
 * @remarks
 * Customers created through the app have no image. `next/image` is configured
 * with no `remotePatterns`, so it can only serve files under `public/` — the
 * six seeded avatars — and pointing it at anything else fails at the optimizer
 * rather than falling back. So "no image" is rendered, never fetched.
 *
 * The initials tile uses the same semantic tokens as the rest of the surface
 * instead of a per-customer color. A generated palette would need its contrast
 * re-verified against both schemes, and the axe checks in the smoke spec block
 * on moderate-impact violations; one known-good pair cannot regress that.
 *
 * `aria-hidden` on the tile is deliberate: every caller renders the customer's
 * name in the adjacent cell, so announcing "AB" first would just make screen
 * reader users hear the name twice.
 */
export function CustomerAvatar({
	imageUrl,
	name,
	size = IMAGE_SIZES.small,
}: CustomerAvatarProps): JSX.Element {
	if (imageUrl) {
		return (
			<Image
				alt={`${name}'s profile picture`}
				className="rounded-full"
				height={size}
				priority={false}
				src={imageUrl}
				width={size}
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			className="flex shrink-0 items-center justify-center rounded-full bg-bg-secondary font-medium text-text-primary"
			data-cy="customer-initials-avatar"
			style={{
				fontSize: size * INITIALS_FONT_RATIO,
				height: size,
				width: size,
			}}
		>
			{toCustomerInitials(name)}
		</span>
	);
}
