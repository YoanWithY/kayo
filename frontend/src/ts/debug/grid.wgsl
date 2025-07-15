struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) ws_position: vec2f,
	@location(1) cs_position: vec3f,
}

#include <utility/frame>

@vertex
fn vertex_main(@builtin(vertex_index) index: u32, @location(0) ls_pos: vec2f) -> VertexOut {
	let camera_grid_offset = floor(getCameraPosition().xy);
	let ws_pos = ls_pos + camera_grid_offset;
	let cs_pos = view.view_mat * vec4f(ws_pos, 0, 1);
	return VertexOut(view.projection_mat * cs_pos, ws_pos, cs_pos.xyz);
}

const line_thickness = 1.0;
fn getGrid(w: vec4f, line_thickness: f32) -> vec4f {
	let val = abs(fract(w.zw - 0.5) - 0.5) / w.xy - (line_thickness - 1);
	return vec4(clamp(1.0 - val, vec2f(0), vec2f(1)), w.xy);
}

fn getAlpha(g_2d: vec4f, grad_factor: f32) -> f32 {
	let coverage = g_2d.xy / (g_2d.zw * 100.0 + 1.0);
	return max(coverage.x, coverage.y) * grad_factor;
}

@fragment
fn fragment_main(fragment: VertexOut) -> R3FragmentOutput {
	let accurate_line_thickness = line_thickness * view.dpr;
	let lt = max(accurate_line_thickness, 1.0);
	let ws_pos = fragment.ws_position;
	
	let grad_factor = smoothstep(view.far_clipping, 0, length(fragment.cs_position));
	let coord_data = vec4f(fwidthFine(ws_pos), ws_pos);
	
	let g_1000_2d = getGrid(coord_data / 1000.0, lt);
	let a1000 = getAlpha(g_1000_2d, grad_factor);
	let a = max(max(max(
		getAlpha(getGrid(coord_data, lt), grad_factor),
		getAlpha(getGrid(coord_data / 10.0, lt), grad_factor)),
		getAlpha(getGrid(coord_data / 100.0, lt), grad_factor)),
		a1000);
	if(a <= 0) {
		discard;
	}
	let isAxis = (abs(ws_pos) < vec2f(500.0)) & (g_1000_2d.xy >= g_1000_2d.yx);
	let color = select(vec3f(0.5), select(select(vec3f(0.9, 0.05, 0.05), vec3f(0.05 , 0.9 , 0.05), isAxis.x), vec3f(0.9, 0.9, 0.1), all(isAxis)), a1000 > 0 && (any(isAxis)));

	let out_color = createOutputFragment(vec4f(color, a * (accurate_line_thickness / lt)), vec2u(fragment.position.xy), true);
	return R3FragmentOutput(out_color, 0);
}