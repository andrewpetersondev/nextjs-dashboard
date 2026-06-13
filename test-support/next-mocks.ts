import { vi } from "vitest";

type NextRedirectError = Error & {
	digest: `NEXT_REDIRECT;${string}`;
};

type NextNavigationMock = {
	redirect: ReturnType<typeof vi.fn<(path: string) => never>>;
	usePathname: ReturnType<typeof vi.fn>;
	useRouter: ReturnType<typeof vi.fn>;
	useSearchParams: ReturnType<typeof vi.fn<() => URLSearchParams>>;
};

type NextCacheMock = {
	revalidatePath: ReturnType<typeof vi.fn>;
	revalidateTag: ReturnType<typeof vi.fn>;
};

type NextHeadersMock = {
	cookies: ReturnType<typeof vi.fn<() => Promise<typeof mockCookies>>>;
	headers: ReturnType<typeof vi.fn<() => Promise<Map<string, string>>>>;
};

const mockCookies = {
	delete: vi.fn(),
	get: vi.fn(),
	getAll: vi.fn(),
	has: vi.fn(),
	set: vi.fn(),
};

const createNextRedirectError = (path: string): NextRedirectError => {
	const error = new Error("NEXT_REDIRECT") as NextRedirectError;
	error.digest = `NEXT_REDIRECT;${path}`;
	return error;
};

const mockNextNavigation = (): NextNavigationMock => ({
	redirect: vi.fn((path: string): never => {
		throw createNextRedirectError(path);
	}),
	usePathname: vi.fn(),
	useRouter: vi.fn(() => ({
		back: vi.fn(),
		forward: vi.fn(),
		push: vi.fn(),
		refresh: vi.fn(),
		replace: vi.fn(),
	})),
	useSearchParams: vi.fn(() => new URLSearchParams()),
});

const mockNextCache = (): NextCacheMock => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
});

const mockNextHeaders = (): NextHeadersMock => {
	const mockHeaders = new Map([
		["user-agent", "test-agent"],
		["x-forwarded-for", "127.0.0.1"],
	]);

	return {
		cookies: vi.fn(async () => mockCookies),
		headers: vi.fn(async () => mockHeaders),
	};
};

export { mockNextCache, mockNextHeaders, mockNextNavigation };
