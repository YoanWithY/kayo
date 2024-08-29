@vertex
fn main_vertex(@buildin(vertex_index) vertexID: u32) -> @buildin(position) {
	return vec4f(floor(vertexID / 2) * 2 - 1, (vertexID % 2) * 2 - 1, 0, 1);
}