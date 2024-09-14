struct R3VertexUniform {
	transformation: mat4x4f,
}
struct R3FragmentUniform {
	state: u32
}
 @group(1) @binding(0) var<uniform> vertexUniform: R3VertexUniform;
 @group(1) @binding(1) var<uniform> fragmentUniform: R3VertexUniform;
