#include <utility/frame>

struct VertexInput {
	@location(0) position: vec3f
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) ws_position: vec3f
}

@vertex
fn vertex_main(vertex: VertexInput) -> VertexOutput {
	let position = view.projectionMat * vec4f(mat3x3f(view.viewMat[0].xyz, view.viewMat[1].xyz, view.viewMat[2].xyz) * vertex.position, 1.0);
	return VertexOutput(position, vertex.position);
}

#include <utility/fragmentOutput>
@fragment
fn fragment_main(fragment: VertexOutput) -> R3FragmentOutput {
	let ws_dir = normalize(fragment.ws_position);
	var interpolant1 = dot(ws_dir, vec3f(0, 0, 1));
	interpolant1 = (interpolant1 * interpolant1 * interpolant1) * 0.5 + 0.5;

	let albedo = sRGB_EOTF(mix(vec3(0.5), vec3(1.0), interpolant1));
	var outColor = vec4f(createOutputFragment(albedo), 0);
	outColor = vec4f(0.0, 0.0, 0.0, 0.0);
	return R3FragmentOutput(outColor, 0);
}