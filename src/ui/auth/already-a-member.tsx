import Link from "next/link";

export default function AlreadyAMember() {
    return (
        <p className="text-text-accent mt-10 text-center text-sm/6">
            Already a member?{" "}
            <Link
                href="/login"
                className="text-text-secondary hover:text-text-hover font-semibold"
            >
                Sign in here
            </Link>
        </p>
    )
}
