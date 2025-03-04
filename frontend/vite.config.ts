import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ command }) => {
	let obj = {
		plugins: [
			svgLoader(),
		],
		build: {
			target: 'ES2023'
		},
		base: '/kayo/'
	}
	if (command === "serve") {
		obj["server"] = {
			https: {
				key: fs.readFileSync(path.resolve(__dirname, '../local.key')),
				cert: fs.readFileSync(path.resolve(__dirname, '../local.crt')),
			},
			host: true,
		}
	}
	return obj;
});