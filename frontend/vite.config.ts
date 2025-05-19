import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";
import fs from "fs";
import path from "path";

export default defineConfig(({ command }) => {
	const common = {
		plugins: [svgLoader()],
		build: { target: "ES2023" },
		base: "/kayo/",
	};

	if (command === "serve") {
		common["server"] = {
			https: {
				key: fs.readFileSync(path.resolve(__dirname, "private.key")),
				cert: fs.readFileSync(path.resolve(__dirname, "certificate.crt")),
			},
			host: true,
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
		};
	}

	return common;
});
