#include <virtualTexture>

@vertex
fn vertex_main(@builtin(vertex_index) vertexID: u32) -> @builtin(position) vec4f {
	return vec4f(vec2f(f32(vertexID / 2), f32(vertexID % 2)) * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let c = textureLoad(svt_physical_texture, vec2i(position.xy), 0, 0);
	return c;
}