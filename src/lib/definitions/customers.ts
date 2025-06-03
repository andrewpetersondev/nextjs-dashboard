export type Customer = {
	id: string;
	name: string;
	email: string;
	image_url: string;
};

export type CustomerField = {
	id: string;
	name: string;
};

export type CustomersTableType = {
	id: string;
	name: string;
	email: string;
	image_url: string;
	total_invoices: number;
	total_pending: number;
	total_paid: number;
};

export type FormattedCustomersTable = {
	email: string;
	id: string;
	image_url: string;
	name: string;
	total_invoices: number;
	total_paid: string;
	total_pending: string;
};
