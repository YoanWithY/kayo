import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";
import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
	const common = {
		plugins: [
			svgLoader(),
			viteStaticCopy({
				targets: [{ src: "src/c/KayoCorePP.wasm.map", dest: "./assets/" }],
			}),
			VitePWA({
				registerType: "autoUpdate",
				devOptions: {
					// enabled: true,
				},
				workbox: {
					globPatterns: ["**/*"],
				},
				manifest: {
					name: "Kayo Engine",
					short_name: "Kayo",
					description: "",
					theme_color: "#000000ff",
					icons: [
						{
							src: "/favicon.svg",
							sizes: "any",
							type: "image/svg+xml",
						},
						{
							src: "/favicon_maskable.svg",
							sizes: "any",
							type: "image/svg+xml",
							purpose: "maskable",
						},
					],
					display: "standalone",
					background_color: "#000000",
				},
			}),
		],
		build: {
			target: "ES2023",
			sourcemap: true,
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
			// https: {
			// 	key: fs.readFileSync(path.resolve(__dirname, "localHttps/private.key")),
			// 	cert: fs.readFileSync(path.resolve(__dirname, "localHttps/certificate.crt")),
			// },
			host: true,
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
		};
	}

	return common;
});
