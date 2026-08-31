import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { ImageResponse } from "next/og";
import { BRAND_NAME, HERO_TAGLINE } from "@/ui/brand/brand.constants";

// Satori (ImageResponse) supports only inline styles — no Tailwind classes,
// no CSS variables. Literal hexes: the landing CTA's pinned sky accent on
// near-black, with the bundled default font (Noto Sans — the app's body font).
const BG = "#030712"; // gray-950
const ACCENT = "#0ea5e9"; // sky-500
const TEXT = "#f9fafb"; // gray-50
const MUTED = "#9ca3af"; // gray-400

export const alt = "Acme Dashboard — a portfolio dashboard by Andrew Peterson";

export const size = { height: 630, width: 1200 };

export const contentType = "image/png";

// Statically generated at build time (no request-time APIs) — identical on
// Vercel and the Docker standalone target.
export default function OpengraphImage(): ImageResponse {
	return new ImageResponse(
		<div
			style={{
				alignItems: "center",
				backgroundColor: BG,
				color: TEXT,
				display: "flex",
				flexDirection: "column",
				gap: 28,
				height: "100%",
				justifyContent: "center",
				width: "100%",
			}}
		>
			<div
				style={{
					alignItems: "center",
					color: ACCENT,
					display: "flex",
					gap: 20,
				}}
			>
				<GlobeAltIcon
					style={{ height: 110, transform: "rotate(15deg)", width: 110 }}
				/>
				<div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
					{BRAND_NAME}
				</div>
			</div>
			<div
				style={{
					display: "flex",
					fontSize: 44,
					maxWidth: 980,
					textAlign: "center",
				}}
			>
				{HERO_TAGLINE}
			</div>
			<div style={{ color: MUTED, display: "flex", fontSize: 28 }}>
				Portfolio project by Andrew Peterson · Next.js · TypeScript · PostgreSQL
			</div>
		</div>,
		size,
	);
}
