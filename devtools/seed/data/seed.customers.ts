import type { SeedCustomer } from "@devtools/seed/data/seed.types";
import { CUSTOMER_IMAGE_URL_NONE } from "@/modules/customers/domain/customer-policy";

/**
 * Demo customers data used during seeding.
 */
export const customersData: readonly SeedCustomer[] = [
	{
		email: "evil@rabbit.com",
		imageUrl: "/customers/evil-rabbit.png",
		name: "Evil Rabbits",
	},
	{
		email: "delba@oliveira.com",
		imageUrl: "/customers/delba-de-oliveira.png",
		name: "Delba de Oliveira",
	},
	{
		email: "lee@robinson.com",
		imageUrl: "/customers/lee-robinson.png",
		name: "Lee Robinson",
	},
	{
		email: "michael@novotny.com",
		imageUrl: "/customers/michael-novotny.png",
		name: "Michael Novotny",
	},
	{
		email: "amy@burns.com",
		imageUrl: "/customers/amy-burns.png",
		name: "Amy Burns",
	},
	{
		email: "balazs@orban.com",
		imageUrl: "/customers/balazs-orban.png",
		name: "Balazs Orban",
	},
	{
		// Deliberately pictureless: exercises the initials-avatar fallback in the
		// seeded demo, so the path a customer created through the app takes is
		// visible without having to create one by hand. `next/image` has no
		// `remotePatterns`, so "no image" is the only honest state for a customer
		// with no file under `public/customers/`.
		email: "priya@raghunathan.dev",
		imageUrl: CUSTOMER_IMAGE_URL_NONE,
		name: "Priya Raghunathan",
	},
] as const;
