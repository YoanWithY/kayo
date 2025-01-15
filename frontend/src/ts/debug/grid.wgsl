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
	let cs_pos = view.viewMat * vec4f(ws_pos, 0, 1);
	let pos = view.projectionMat * cs_pos;
	let clamped_pos = pos.xyww;
	return VertexOut(clamped_pos, ls_pos, ws_pos, cs_pos.xyz, pos);
}

const lineThickness = 1.0;
fn getGrid(coord: vec2f, lineThickness: f32) -> vec4f {
	let w = fwidthFine(coord);
	let val = abs(fract(coord - 0.5) - 0.5) / w - (lineThickness - 1);
	return vec4(clamp(1.0 - val, vec2f(0), vec2f(1)), w);
}

fn getAlpha(g_2D: vec4f, dist: f32, endFactor: f32, gridMode: i32, far: f32) -> f32 {
	var converage = max(g_2D.x / (g_2D.z * 80 + 1), g_2D.y / (g_2D.w * 80 + 1));
	let isX = g_2D.x >= g_2D.y;
	
	let falloff = smoothstep(far * endFactor, 0, dist);
	return converage * falloff;
}

struct FragmentOutput {
	@location(0) color: vec4f,
	@builtin(frag_depth) depth: f32,
}

@fragment
fn fragment_main(vertexData: VertexOut) -> FragmentOutput {
	let abs_ls_pos = abs(vertexData.ls_position);

	let lt = lineThickness * sqrt(getDPR());
	let ws_pos = vertexData.ws_position;
	let g1_2D = getGrid(ws_pos, lt);
	let g10_2D = getGrid(ws_pos / 10.0, lt);
	let g100_2D = getGrid(ws_pos / 100.0, lt);
	let g1000_2D = getGrid(ws_pos / 1000.0, lt);
	
	let camPos = getCameraPosition();
	let dist = length(vertexData.cs_position);
	let endFactor = smoothstep(0.0, 500.0, abs(camPos.z)) * 10.0 + 1.0;
	let far = getFar();
	let depthOut = clamp(vertexData.actual_pos.z / vertexData.actual_pos.w, 0.0, 1);
	let a1 = getAlpha(g1_2D, dist, endFactor, 0, far);
	let a10 = getAlpha(g10_2D, dist, endFactor, 1, far);
	let a100 = getAlpha(g100_2D, dist, endFactor, 2, far);
	let a1000 = getAlpha(g1000_2D, dist, endFactor, 3, far);
	let a = max(max(max(a1, a10), a100), a1000);
	if(a <= 0) {
		discard;
	}
	var color = vec3f(0.3);
	
	if(a1000 > 0) {
		let abs_ws_pos = abs(ws_pos);
		let isXAxis = abs_ws_pos.x < 500 && g1000_2D.x >= g1000_2D.y;
		let isYAxis = abs_ws_pos.y < 500 && g1000_2D.y >= g1000_2D.x;
	
		if(isXAxis && isYAxis) {
			color = vec3f(0.5);
		} else if(isXAxis) {
			color = vec3f(0.2, 1.0, 0.2);
		} else if(isYAxis) {
			color = vec3f(1.0, 0.2, 0.2);
		}
	}

	return FragmentOutput(vec4f(color, a * 0.5), depthOut);
}