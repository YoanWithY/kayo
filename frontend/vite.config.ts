import { defineConfig, type UserConfig } from "vite";
import svgLoader from "vite-svg-loader";
import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import checker from "vite-plugin-checker";
import pkg from "./package.json";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

function ensureDevCertsSync() {
	const CERT_DIR = "certs";
	const keyPath = path.join(CERT_DIR, "key.pem");
	const certPath = path.join(CERT_DIR, "cert.pem");
	const logPath = path.join(CERT_DIR, "log.txt");

	if (!fs.existsSync(CERT_DIR)) {
		fs.mkdirSync(CERT_DIR, { recursive: true });
	}
	execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${keyPath} -out ${certPath} -days 365 -subj "/CN=localhost" > ${logPath} 2>&1`);

	return {
		key: fs.readFileSync(keyPath),
		cert: fs.readFileSync(certPath),
	};
}

export default defineConfig(
	({ command }): UserConfig => {
		const base: UserConfig = {
			define: {
				"import.meta.env.PACKAGE_VERSION": JSON.stringify(pkg.version),
			},
			plugins: [
				svgLoader(),
				viteStaticCopy({
					targets: [{ src: "src/c/KayoCorePP.wasm.map", dest: "./assets/" }],
				}),
				checker({
					eslint: {
						lintCommand: "eslint .",
						useFlatConfig: true,
					},
				}),
				VitePWA({
					registerType: "autoUpdate",
					devOptions: { enabled: false },
					workbox: {
						globPatterns: ["**/*"],
						maximumFileSizeToCacheInBytes: 3_000_000,
					},
					manifest: {
						name: "Kayo Engine",
						short_name: "Kayo",
						description: "The 3D multimedia engine.",
						theme_color: "#161616",
						background_color: "#222222",
						display: "standalone",
						icons: [
							{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
							{
								src: "/favicon_maskable.svg",
								sizes: "any",
								type: "image/svg+xml",
								purpose: "maskable",
							},
						],
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
			return {
				...base,
				server: {
					host: true,
					https: ensureDevCertsSync(),
					headers: {
						"Cross-Origin-Opener-Policy": "same-origin",
						"Cross-Origin-Embedder-Policy": "require-corp",
					},
				},
			};
		}

		return base;
	}
);
