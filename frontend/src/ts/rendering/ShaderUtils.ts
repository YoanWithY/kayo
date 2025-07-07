import frame from "../../wgsl/utility/frame.wgsl?raw";
import fullScreenQuad from "../../wgsl/utility/fullScreenQuadVertex.wgsl?raw";
import virtualTexture from "../../wgsl/virtualTexture.wgsl?raw";
import r3 from "../../wgsl/utility/r3.wgsl?raw";

const snippets: { [key: string]: string } = {
	"utility/frame": frame,
	"utility/fullScreenQuadVertex": fullScreenQuad,
	"utility/r3": r3,
	virtualTexture: virtualTexture,
};

export function resolveIncludes(code: string): string {
	return code.replace(/#include\s*<([^>]+)>/g, (match, p1) => {
		const includedCode = snippets[p1];
		if (!includedCode) {
			console.error("Could not resolve:", match);
			return match;
		}
		return resolveIncludes(includedCode);
	});
}

export function resolveVariables(code: string, map: { [key: string]: string }): string {
	for (const key in map) code = code.replaceAll(`#${key}`, map[key]);
	return code;
}

export function resolveShader(code: string, map: { [key: string]: string } = {}): string {
	return resolveVariables(resolveIncludes(code), map);
}
