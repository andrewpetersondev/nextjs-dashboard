import { z } from "zod";

export type User = {
  id: string; // name: string;
  username: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string; // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type FetchLatestInvoicesData = {
  amount: number;
  email: string;
  id: string;
  image_url: string;
  name: string;
  paymentStatus: string;
};

export type ModifiedLatestInvoicesData = Omit<
  FetchLatestInvoicesData,
  "amount"
> & {
  amount: string;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type FetchFilteredInvoicesData = {
  id: string;
  amount: number;
  date: string;
  name: string;
  email: string;
  image_url: string;
  paymentStatus: "pending" | "paid";
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
};

export type FilteredInvoiceData = {
  id: string;
  amount: number;
  date: string;
  name: string;
  email: string;
  image_url: string;
  paymentStatus: "pending" | "paid";
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

// export type FormattedCustomersTable = {
//   id: string;
//   name: string;
//   email: string;
//   image_url: string;
//   total_invoices: number;
//   total_pending: string;
//   total_paid: string;
// };

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customerId: string;
  amount: number;
  status: "pending" | "paid" | null;
};

export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters long." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export type SignupFormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(8, { message: "Password is required." }).trim(),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type InvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Invalid customer id",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Amount must be greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select a status",
  }),
  date: z.string(),
});

// type of parameters for encrypt()
// return type for encrypt() is string
export type SessionPayload = {
  user: {
    userId: string;
    role: string;
    expiresAt: Date;
  };
};

// type of parameters for decrypt() = string || undefined = ""
//  return type for decrypt()
export type Session =
  | {
      user: {
        isAuthorized: boolean;
        userId: string;
        role: string;
        expiresAt: Date;
      };
      iat: number;
      exp: number;
    }
  | undefined;
