struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@vertex
fn vertex_main(
	@location(0) position: vec4f,
	@location(1) color: vec4f) -> VertexOut {
		var output: VertexOut;
		output.position = position;
		output.color = color;
		return output;
}

@vertex
fn vertex_main2(
	@location(0) position: vec4f,
	@location(1) color: vec4f) -> VertexOut {
		return VertexOut(vec4f(position.x * 0.5, position.y * 0.5, position.zw), vec4f(0));
}


#include <utility/fragmentOutput>

@group(0) @binding(0) var myTexture: texture_2d<f32>;
@group(0) @binding(1) var mySampler: sampler;
@fragment
fn fragment_main(vertexData: VertexOut) -> @location(0) vec4f {
	let inColor = textureLoad(myTexture, vec2i(vertexData.position.xy), 0);
	return vec4f(createOutputFragment(sRGB_gammaExpand(inColor.rgb)), 1);
}