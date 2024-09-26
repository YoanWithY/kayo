declare module '*.wgsl?raw' {
	const content: string;
	export default content;
}
declare module "*.wasm?init" {
	const value: () => Promise<WebAssembly.Instance>;
	export default value;
}

declare module "*.wasm?url" {
	const value: RequestInfo | URL;
	export default value;
}