#include <utility/linearRGBToLinearDisplayP3>
#include <utility/sRGB_EOTF>
#include <utility/sRGB_OETF>

override targetColorSpace: i32; // 0: sRGB; 1: Display-P3
override componentTranfere: i32; // 0: none; 1: sRGB

fn convertToTargetColorSpace(linearRGB: vec3f) -> vec3f {
	if(targetColorSpace == 1) {
		return linearRGBToLinearDisplayP3(linearRGB);
	}
	return linearRGB;
}

fn createOutputFragment(linearRGB: vec3f) -> vec3f {
	var color = convertToTargetColorSpace(linearRGB);
	if(componentTranfere == 1) {
		return sRGB_OETF(color);
	}
	return color;
}

fn createSelection(state: u32) -> vec2f {
	return
	select(
		vec2f(1,0),
		vec2f(0),
		(state & 1u) > 0u) +
	select(
		vec2f(0, 1),
		vec2f(0),
		(state & 2u) > 0u);
}

struct R3FragmentOutput {
	@location(0) color: vec4f,
	@location(1) selection: vec2f
}