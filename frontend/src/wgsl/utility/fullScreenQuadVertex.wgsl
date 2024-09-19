@vertex
fn vertex_main(@builtin(vertex_index) vertexID: u32) -> @builtin(position) vec4f {
	return vec4f(vec2f(f32(vertexID / 2), f32(vertexID % 2)) * 2 - 1, 0.0, 1.0);
}