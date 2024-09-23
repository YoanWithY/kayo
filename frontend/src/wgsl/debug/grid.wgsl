struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) ls_position: vec2f,
	@location(1) ws_position: vec2f,
	@location(2) cs_position: vec3f,
	@location(3) @interpolate(flat) instance: u32,
}

#include <utility/frame>

fn isLargePass(instance: u32) -> bool {
	return instance != 0;
}
const smallSize = 10.0;

@vertex
fn vertex_main(@builtin(vertex_index) index: u32, @builtin(instance_index) instance: u32) -> VertexOut {
	let x = index / 2;
	let y = index % 2;

	let far = getFar();
	let largePass = isLargePass(instance);
	let ls_pos = (vec2f(f32(x), f32(y)) * 2.0 - 1.0) * select(smallSize + 0.125, far * 4.0, largePass);

	let cameraGridOffset = floor(getCameraPosition().xy);
	let ws_pos = ls_pos + cameraGridOffset;
	let cs_pos = view.viewMat * vec4f(ws_pos, 0, 1);
	let pos = view.projectionMat * cs_pos;
	return VertexOut(pos, ls_pos, ws_pos, cs_pos.xyz, instance);
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

@fragment
fn fragment_main(vertexData: VertexOut) -> @location(0) vec4f {
	let largePass = isLargePass(vertexData.instance);
	let abs_ls_pos = abs(vertexData.ls_position);
	let isInsideSmall = abs_ls_pos.x <= smallSize && abs_ls_pos.y <= smallSize;

	if((largePass && isInsideSmall) || (!largePass && !isInsideSmall)) {
		discard;
	}
	let lt = lineThickness * sqrt(getDPR());
	let ws_pos = vertexData.ws_position;
	let g1_2D = getGrid(ws_pos, lt);
	let g10_2D = getGrid(ws_pos / 10.0, lt);
	let g100_2D = getGrid(ws_pos / 100.0, lt);
	let g1000_2D = getGrid(ws_pos / 1000.0, lt);
	
	let camPos = getCameraPosition();
	let dist = length(vertexData.cs_position);
	let endFactor = smoothstep(0.0, 50.0, abs(camPos.z)) * 0.6 + 0.4;
	let far = view.projectionData[1];
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

	return vec4f (color, a * 0.5);
}