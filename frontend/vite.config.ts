import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
	plugins: [svgLoader()],
	build: {
		target: 'ES2023'
	},
	base: '/kayo/'
});