import pino from "pino";

export const logger = pino({
	name: "auth",
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
});
