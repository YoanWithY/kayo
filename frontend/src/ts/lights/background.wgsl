#include <utility/frame>

struct VertexInput {
	@builtin(vertex_index) id: u32,
	@location(0) position: vec3f
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) ws_position: vec3f
}

@vertex
fn vertex_main(vertex: VertexInput) -> VertexOutput {
	let position = view.projection_mat * vec4f(mat3x3f(view.view_mat[0].xyz, view.view_mat[1].xyz, view.view_mat[2].xyz) * vertex.position, 1.0);
	return VertexOutput(position, vertex.position);
}

@fragment
fn fragment_main(fragment: VertexOutput) -> R3FragmentOutput {
	let ws_dir = normalize(fragment.ws_position);
	let pixel_coord: vec2u = vec2u(fragment.position.xy);
	var interpolant1 = dot(ws_dir, vec3f(0, 0, 1));
	interpolant1 = (interpolant1 * interpolant1 * interpolant1) * 0.5 + 0.5;

	let srgb = vec3f(fragment.ws_position) * 0.5 + 0.5;
	let out_color = vec4f(sRGB_EOTF(srgb), 1.0);
	let out_display = createOutputFragment(out_color.rgb, pixel_coord);
	return R3FragmentOutput(vec4f(out_display, 1.0), 0);
}