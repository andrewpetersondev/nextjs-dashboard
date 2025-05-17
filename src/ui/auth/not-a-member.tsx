import Link from "next/link";

export default function NotAMember() {
	return (
		<p className="text-text-accent mt-10 text-center text-sm/6">
			Not a member?{" "}
			<Link
				href="/signup"
				className="text-text-secondary hover:text-text-hover font-semibold"
			>
				Sign up here
			</Link>
		</p>
	);
}
