import type { User } from "@/src/lib/definitions/users";
import { useActionState } from "react";

type EditUserFormState = {
	message: string | null;
	errors: {
		username?: string[];
		email?: string[];
		password?: string[];
		role?: string[];
	};
};

export default function EditUserForm({ user }: { user: User }) {
	const initialState = { message: null, errors: {} };

	return "edit user form";
}
