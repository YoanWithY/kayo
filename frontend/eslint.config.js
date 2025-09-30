import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

const noAwaitRule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow await; use .then() instead",
		},
		schema: [],
		messages: {
			noAwait: "Await expressions are not allowed. Use .then() instead.",
		},
	},
	create(context) {
		return {
			AwaitExpression(node) {
				context.report({ node, messageId: "noAwait" });
			},
		};
	},
};

const noAnonymousArrowRule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow anonymous arrow functions unless assigned to variable, property, or class field",
		},
		schema: [],
		messages: {
			noAnonymousArrow: "Anonymous arrow functions must be assigned to a variable, property, or class field.",
		},
	},
	create(context) {
		return {
			ArrowFunctionExpression(node) {
				const parent = node.parent;
				if (
					parent.type === "VariableDeclarator" ||
					parent.type === "Property" ||
					parent.type === "AssignmentExpression" ||
					parent.type === "ClassProperty" ||
					parent.type === "PropertyDefinition"
				) {
					return;
				}
				context.report({ node, messageId: "noAnonymousArrow" });
			},
		};
	},
};

export default defineConfig([
	globalIgnores(["node_modules/", "dist/", "**/*.config.js", "dev-dist/", "src/c/"]),
	tseslint.configs.recommended,
	{
		files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
		plugins: {
			local: {
				rules: {
					"no-await": noAwaitRule,
					"no-anonymous-arrow-function": noAnonymousArrowRule,
				},
			},
			js,
		},
		languageOptions: { globals: globals.browser },
		rules: {
			"local/no-await": "error",
			"local/no-anonymous-arrow-function": "error",
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
			"func-names": ["error", "always"],
		},
	},
]);
