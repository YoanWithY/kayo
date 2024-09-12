struct View {
	viewMat: mat4x4f,
	projectionMat: mat4x4f,
	cameraMat: mat4x4f,
	projectionData: vec4f, // [0] near clipping plane; [1] far clipping plane
	viewport: vec4u,
	frame: vec4u
}
@group(0) @binding(0) var<uniform> view: View;
fn getCameraPosition() -> vec3f {
	return view.cameraMat[3].xyz;
}