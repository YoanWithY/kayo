struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) ls_position: vec2f,
	@location(1) ws_position: vec2f,
	@location(2) cs_position: vec3f,
	@location(3) actual_pos: vec4f,
}

#include <utility/frame>

@vertex
fn vertex_main(@builtin(vertex_index) index: u32, @location(0) ls_pos: vec2f) -> VertexOut {
	let cameraGridOffset = floor(getCameraPosition().xy);
	let ws_pos = ls_pos + cameraGridOffset;
	let cs_pos = view.view_mat * vec4f(ws_pos, 0, 1);
	let pos = view.projection_mat * cs_pos;
	let clamped_pos = pos.xyww;
	return VertexOut(clamped_pos, ls_pos, ws_pos, cs_pos.xyz, pos);
}

const line_thickness = 1.0;
fn getGrid(coord: vec2f, line_thickness: f32) -> vec4f {
	let w = fwidthFine(coord);
	let val = abs(fract(coord - 0.5) - 0.5) / w - (line_thickness - 1);
	return vec4(clamp(1.0 - val, vec2f(0), vec2f(1)), w);
}

fn getAlpha(g_2d: vec4f, dist: f32, end_factor: f32) -> f32 {
	let coverage = g_2d.xy / (g_2d.zw * 80.0 + 1.0);
	return max(coverage.x, coverage.y) * smoothstep(end_factor, 0, dist);
}

struct FragmentOutput {
	@location(0) color: vec4f,
	@location(1) id: u32,
	@builtin(frag_depth) depth: f32,
}

@fragment
fn fragment_main(fragment: VertexOut) -> FragmentOutput {
	let accurate_line_thickness = line_thickness * view.dpr;
	let lt = max(accurate_line_thickness, 1.0);
	let ws_pos = fragment.ws_position;
	
	let dist = length(fragment.cs_position);
	let end_factor = (smoothstep(0.0, 500.0, abs(getCameraPosition().z)) * 10.0 + 1.0) * view.far_clipping;
	
	let g_1000_2d = getGrid(ws_pos / 1000.0, lt);
	let a1000 = getAlpha(g_1000_2d, dist, end_factor);
	let a = max(max(max(
		getAlpha(getGrid(ws_pos, lt), dist, end_factor),
		getAlpha(getGrid(ws_pos / 10.0, lt), dist, end_factor)),
		getAlpha(getGrid(ws_pos / 100.0, lt), dist, end_factor)),
		a1000);
	if(a <= 0) {
		discard;
	}
	var color = vec3f(0.3);
	
	if(a1000 > 0) {
		let isAxis = (abs(ws_pos) < vec2f(500.0)) & (g_1000_2d.xy >= g_1000_2d.yx);
		if(isAxis.x && isAxis.y) {
			color = vec3f(0.5);
		} else if(isAxis.x) {
			color = vec3f(0.1, 1.0, 0.1);
		} else if(isAxis.y) {
			color = vec3f(1.0, 0.1, 0.1);
		}
	}

	let out_color = createOutputFragment(vec4f(color, a * (accurate_line_thickness / lt)), vec2u(fragment.position.xy), true);
	return FragmentOutput(out_color, 0, clamp(fragment.actual_pos.z / fragment.actual_pos.w, 0, 1));
}