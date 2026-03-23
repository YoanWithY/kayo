struct VertexIn {
	@location(0) ls_position: vec3f,
	@location(1) ls_normal: vec3f,
	@location(2) uv: vec2f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(1) cs_position: vec3f,
    @location(2) ls_normal: vec3f,
    @location(3) uv: vec2f
};

#include <utility/frame>

@vertex
fn vertex_main(vertex: VertexIn) -> VertexOut {
	let cs_position = (view.view_mat * vec4f(vertex.ls_position, 1.0)).xyz;
	let out_pos = view.projection_mat * vec4f(cs_position, 1.0);
	return VertexOut(out_pos, cs_position, vertex.ls_normal, vertex.uv);
}

@fragment
fn fragment_main(fragment: VertexOut) -> R3FragmentOutput {
	let pixel_coord: vec2u = vec2u(fragment.position.xy);
	let albedo = vec3f(1.0);
    let light = vec3f(1.0) * dot(fragment.ls_normal, vec3f(0.5, 0.5, 0.5));

	let ou_color = createOutputFragment(vec4f(albedo * light, 1), pixel_coord, true);
	return R3FragmentOutput(ou_color, 1);
}