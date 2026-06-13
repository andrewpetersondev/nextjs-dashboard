import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "dotenv";

const mode = process.argv[2];

if (mode !== "open" && mode !== "run") {
	throw new Error(
		'Usage: tsx devtools/cli/cypress-with-server.cli.ts <"open" | "run">',
	);
}

// The e2e harness OWNS the test port (Bug A of the port-reuse trap). Read it
// straight from .env.test.local rather than trusting process.env.PORT: the
// env:* scripts load dotenv WITHOUT --override, so an exported shell PORT
// silently shadows the file's value and the whole suite can target the wrong
// server. Pinning the authoritative value below removes that ambiguity. See
// BACKLOG "e2e port-reuse guard".
const ENV_TEST_FILE = ".env.test.local";

function readTestPort(): number {
	let parsed: Record<string, string>;
	try {
		parsed = parse(readFileSync(path.resolve(process.cwd(), ENV_TEST_FILE)));
	} catch (cause) {
		throw new Error(`Cannot read ${ENV_TEST_FILE}.`, { cause });
	}

	const portRaw = parsed.PORT;
	if (!portRaw) {
		throw new Error(`Missing PORT in ${ENV_TEST_FILE}.`);
	}

	const port = Number(portRaw);
	// biome-ignore lint/style/noMagicNumbers: valid TCP port range
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`Invalid PORT in ${ENV_TEST_FILE}: ${portRaw}`);
	}
	return port;
}

const port = readTestPort();

// A leftover exported PORT would otherwise win at every dotenv layer; warn so
// the mismatch is visible, then pin the authoritative value in the child env.
if (process.env.PORT && process.env.PORT !== String(port)) {
	console.warn(
		`[cypress-with-server] Ignoring exported PORT=${process.env.PORT}; pinning ${ENV_TEST_FILE} PORT=${port}.`,
	);
}

const baseUrl = `http://localhost:${port}`;
const cypressCommand = mode === "open" ? "pnpm cy:e2e:open" : "pnpm cy:e2e:run";
// Verify the server that answered is actually the test DB before any spec runs
// (Bug B: start-server-and-test accepts any 2xx on the port, identity-blind).
const testCommand = `pnpm cy:preflight ${baseUrl} && ${cypressCommand}`;

const child = spawn(
	"pnpm",
	["exec", "start-server-and-test", "pnpm cy:server", baseUrl, testCommand],
	{
		// Pin PORT so the spawned server, the wait-on probe, and Cypress all
		// agree on it regardless of any value inherited from the shell.
		env: { ...process.env, PORT: String(port) },
		stdio: "inherit",
	},
);

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}

	process.exit(code ?? 1);
});

child.on("error", (error) => {
	console.error(error);
	process.exit(1);
});
