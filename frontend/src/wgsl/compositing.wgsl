#include <utility/fullScreenQuadVertex>

@group(0) @binding(0) var overlayRT: texture_2d<f32>;
@group(0) @binding(1) var idRT: texture_2d<u32>;
@group(0) @binding(2) var selectionRT: texture_2d<u32>;

#include <utility/fragmentOutput>

const searchSize = 1;
const edgeColorArray: array<vec4f, 3> = array<vec4f, 3>(
	vec4f(0.0, 0.0, 0.0, 0.2),
	vec4f(0.93, 0.34, 0.0, 1.0),
	vec4f(1.0, 0.63, 0.16, 1.0)
);
fn selectionOverlay(tc: vec2i) -> vec4f {
	let thisID = textureLoad(idRT, tc, 0).x;
	let thisSelection = textureLoad(selectionRT, tc, 0).x;
	var maxSelection = thisSelection;
	var idChange = false;
	var selectionChange = false;
	for(var y = -searchSize; y <= searchSize; y += searchSize) {
		for(var x = -searchSize; x <= searchSize; x += searchSize) {
			if(x == 0 && y == 0) {
				continue;
			}
			let val = textureLoad(idRT, tc + vec2i(x, y), 0).x;
			let selection = textureLoad(selectionRT, tc + vec2i(x, y), 0).x;
			maxSelection = max(maxSelection, selection);
			idChange |= val != thisID;
			selectionChange |= selection != thisSelection;
		}
	}
	if(!idChange && !selectionChange) {
		return vec4(0);
	}

	if(idChange && !selectionChange) {
		return edgeColorArray[0];
	}

	var factor = vec4f(1);
	if(!idChange && selectionChange) {
		factor.a = 0.5;
	}

	if(thisSelection == 0) {
		return edgeColorArray[maxSelection] * factor;
	}
	
	return edgeColorArray[thisSelection] * factor;
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let tc = vec2i(position.xy);
	let overlay = textureLoad(overlayRT, tc, 0);
	let selection = selectionOverlay(tc);
	let color = createOutputFragment(mix(overlay.rgb, selection.rgb, selection.a));
	return vec4f(color, max(overlay.a, selection.a));
}