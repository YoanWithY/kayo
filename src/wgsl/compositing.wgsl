#include <utility/fullScreenQuadVertex>

@group(0) @binding(0) var overlayRT: texture_2d<f32>;
@group(0) @binding(1) var selectionRT: texture_2d<f32>;

#include <utility/fragmentOutput>

const searchSize = 2;
fn selectionOverlay(tc: vec2i) -> f32 {
	var thisVal = textureLoad(selectionRT, tc, 0).x;
	var maxVal = thisVal;
	for(var y = -searchSize; y <= searchSize; y += 2 * searchSize) {
		for(var x = -searchSize; x <= searchSize; x++) {
			let val = textureLoad(selectionRT, tc + vec2i(x, y), 0);
			maxVal = max(maxVal, val.x);
		}
	}
	for(var x = -searchSize; x <= searchSize; x += 2 * searchSize) {
		for(var y = -searchSize + 1; y < searchSize; y++) {
			let val = textureLoad(selectionRT, tc + vec2i(x, y), 0);
			maxVal = max(maxVal, val.x);
		}
	}
	return clamp(maxVal - thisVal, 0.0, 1.0);
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let tc = vec2i(position.xy);
	let overlay = textureLoad(overlayRT, tc, 0);
	let selection = selectionOverlay(tc);
	let color = createOutputFragment(mix(overlay.rgb, vec3f(1), selection));
	return vec4(color, max(overlay.a, selection));
}