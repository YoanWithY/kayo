import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";
import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
	const common = {
		plugins: [svgLoader()],
		build: {
			target: "ES2023",
			rollupOptions: {
				input: {
					main: resolve(__dirname, "index.html"),
					subwindow: resolve(__dirname, "subwindow/index.html"),
				},
			},
		},
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
