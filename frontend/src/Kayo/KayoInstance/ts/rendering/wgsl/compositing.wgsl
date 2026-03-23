#include <utility/fullScreenQuadVertex>

@group(0) @binding(0) var overlayRT: texture_2d<f32>;
@group(0) @binding(1) var idRT: texture_2d<u32>;
@group(0) @binding(2) var selectionRT: texture_2d<u32>;

#include <utility/targetColorSpace>

const searchSize = 2;
const edgeColorArray: array<vec4f, 3> = array<vec4f, 3>(
	vec4f(0.0, 0.0, 0.0, 0.2),
	vec4f(0.93, 0.34, 0.0, 1.0),
	vec4f(1.0, 0.63, 0.16, 1.0)
);
fn selectionOverlay(tc: vec2i) -> vec4f {
	let this_id = textureLoad(idRT, tc, 0).x;
	let this_selection = textureLoad(selectionRT, tc, 0).x;
	var max_selection = this_selection;
	var id_change = false;
	var selectionChange = false;
	let tex_size = vec2i(textureDimensions(idRT, 0));
	for (var y = -searchSize; y <= searchSize; y += searchSize) {
		for (var x = -searchSize; x <= searchSize; x += searchSize) {
			let offset = vec2i(x, y);
			let tc_px = tc + offset;
			if (any(vec3<bool>(all(offset == vec2i(0)), any(tc_px < vec2i(0)), any(tc_px >= tex_size)))) {
				continue;
			}
			let id_val = textureLoad(idRT, tc_px, 0).x;
			let selection = textureLoad(selectionRT, tc_px, 0).x;
			max_selection = max(max_selection, selection);
			id_change |= id_val != this_id;
			selectionChange |= selection != this_selection;
		}
	}
	if(!id_change && !selectionChange) {
		return vec4(0);
	}

	if(id_change && !selectionChange) {
		return edgeColorArray[0];
	}

	let factor = select(vec4f(1), vec4f(1, 1, 1, 0.3), !id_change && selectionChange);

	if(this_selection == 0) {
		return edgeColorArray[max_selection] * factor;
	}
	
	return edgeColorArray[this_selection] * factor;
}

fn over_blend(c1: vec4<f32>, c2: vec4<f32>) -> vec4<f32> {
    let alpha_out = c1.a + c2.a * (1.0 - c1.a);
    let color_out = (c1.rgb * c1.a + c2.rgb * c2.a * (1.0 - c1.a)) / alpha_out;
    return vec4<f32>(color_out, alpha_out);
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let tc = vec2i(position.xy);
	let overlay = textureLoad(overlayRT, tc, 0);
	let selection = selectionOverlay(tc);
	let outOverlay = over_blend(overlay, selection);
	let color = convertToTargetColorSpace(outOverlay.rgb);
	return vec4f(color, outOverlay.a);
}