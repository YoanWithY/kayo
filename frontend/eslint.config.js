import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["node_modules/", "dist/", "**/*.config.js", "dev-dist/", "src/c/"]),
	{ files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
	{ files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
	tseslint.configs.recommended,
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_+",
					varsIgnorePattern: "^_+",
					caughtErrorsIgnorePattern: "^_+",
					destructuredArrayIgnorePattern: "^_+",
				},
			],
			"@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
		},
	},
]);
