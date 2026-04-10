import { spawn } from "node:child_process";
import process from "node:process";

const mode = process.argv[2];

if (mode !== "open" && mode !== "run") {
	throw new Error(
		'Usage: tsx devtools/cli/cypress-with-server.cli.ts <"open" | "run">',
	);
}

const portRaw = process.env.PORT;

if (!portRaw) {
	throw new Error("Missing PORT in environment.");
}

const port = Number(portRaw);

// biome-ignore lint/style/noMagicNumbers: valid TCP port range
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
	throw new Error(`Invalid PORT value: ${portRaw}`);
}

const baseUrl = `http://localhost:${port}`;
const cypressCommand = mode === "open" ? "pnpm cy:e2e:open" : "pnpm cy:e2e:run";

const child = spawn(
	"pnpm",
	["exec", "start-server-and-test", "pnpm cy:server", baseUrl, cypressCommand],
	{
		env: process.env,
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
