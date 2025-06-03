import { fetchFilteredUsers } from "@/src/lib/query/users";
import { UpdateUser } from "@/src/ui/users/buttons";

export default async function UsersTable({
	query,
	currentPage,
}: { query: string; currentPage: number }) {
	const users = await fetchFilteredUsers(query, currentPage);

	return (
		<div>
			{users?.map((user) => (
				<div key={user.id} className="bg-bg-primary mb-2 w-full rounded-md p-4">
					<div className="flex items-center justify-between border-b pb-4">
						<div>
							<div className="mb-2 flex items-center">
								<p>{user.username}</p>
							</div>
							<p className="text-text-primary text-sm">{user.email}</p>
						</div>

						{user.role}
					</div>
					<div className="flex w-full items-center justify-between pt-4">
						<div className="flex justify-end gap-2">
							<UpdateUser id={user.id} />
							{/* <DeleteUser id={user.id} /> */}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
