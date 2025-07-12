import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import pkg from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
	const common = {
		define: {
			"import.meta.env.PACKAGE_VERSION": JSON.stringify(pkg.version),
		},
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
					theme_color: "#323232",
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
					background_color: "#323232",
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
			host: true,
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
		};
	}

	return common;
});
