/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};

// biome-ignore lint/style/noDefaultExport: <it is a config file>
export default config;
