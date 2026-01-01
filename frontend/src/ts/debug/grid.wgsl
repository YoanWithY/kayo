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
const grid_base = vec4f(0.25, 0.25, 0.25, 0.5);
const x_axis_color = vec4f(0.75, -0.1, -0.1, 0.2);
const y_axis_color = vec4f(-0.1, 0.75, -0.1, 0.2);
fn getGrid(w: vec4f, line_thickness: f32) -> vec2f {
	// grid
	let val = abs(fract(w.zw - 0.5) - 0.5) / w.xy - (line_thickness - 1);
	let g_2d = clamp(1.0 - val, vec2f(0), vec2f(1));
	// coverage
	return g_2d / (w.xy * 64.0 + 1.0);
}

fn getAxis(w: vec4f, line_thickness: f32) -> vec2f {
	let val = abs(w.zw) / w.xy - (line_thickness - 1);
	let g_2d = clamp(1.0 - val, vec2f(0), vec2f(1));
	return g_2d;
}

fn blendTogether(a: vec4f, b: vec4f) -> vec4f {
	return vec4f(max(a.rgb * a.a, b.rgb * b.a), max(a.a, b.a));
}

fn fWidthEuclid(w: vec2f) -> vec2f {
	let dx = dpdxFine(w);
	let dy = dpdyFine(w);
	return vec2f(length(vec2f(dx.x, dy.x)), length(vec2f(dx.y, dy.y)));
}

fn fWidthMax(w: vec2f) -> vec2f {
	let dx = abs(dpdxFine(w));
	let dy = abs(dpdyFine(w));
	return vec2f(max(dx.x, dy.x), max(dx.y, dy.y));
}

@fragment
fn fragment_main(fragment: VertexOut) -> R3FragmentOutput {
	let accurate_line_thickness = line_thickness * view.dpr;
	let lt = max(accurate_line_thickness, 1.0);
	let subpixel_line_compensation = accurate_line_thickness / lt;
	let ws_pos = fragment.ws_position;
	
	let grad_factor = max(1.0 + fragment.cs_position.z / view.far_clipping, 0);
	let coord_data = vec4f(fWidthEuclid(ws_pos), ws_pos);
	
	let axis = getAxis(coord_data, lt);
	let a = max(
				max(
						getGrid(coord_data, lt),
						getGrid(coord_data * 0.1, lt)),
				getGrid(coord_data * 0.01, lt)
				) * grad_factor * subpixel_line_compensation;

	let pixel_color = min(grid_base + axis.x * x_axis_color + axis.y * y_axis_color, vec4f(1.0));
	let out_color = createOutputFragment(
		vec4f(pixel_color.rgb, pixel_color.a * max(a.x, a.y)),
		vec2u(fragment.position.xy), true);
	return R3FragmentOutput(out_color, 0);
}