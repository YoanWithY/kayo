declare module "*.wgsl?raw" {
	const content: string;
	export default content;
}

declare module '*.css?inline' {
	const content: string;
	export default content;
}

interface ImportMetaEnv {
	DEV: boolean;
	readonly PACKAGE_VERSION: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "*.css";