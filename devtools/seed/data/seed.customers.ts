import type { SeedCustomer } from "@devtools/seed/data/seed.types";

/**
 * Demo customers data used during seeding.
 */
export const customersData: ReadonlyArray<SeedCustomer> = [
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
] as const;
