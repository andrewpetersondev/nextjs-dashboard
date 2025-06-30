import pino from "pino";

export const logger = pino({
	// biome-ignore lint/style/noProcessEnv: <ignore>
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	name: "auth",
});
