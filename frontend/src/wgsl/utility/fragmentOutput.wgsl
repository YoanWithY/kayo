#include <utility/targetColorSpace>
#include <utility/sRGB_EOTF>
#include <utility/sRGB_OETF>

override componentTranfere: i32 = 1; // 0: none; 1: sRGB
fn createOutputFragment(linearRGB: vec3f) -> vec3f {
	var color = convertToTargetColorSpace(linearRGB);
	if(componentTranfere == 1) {
		return sRGB_OETF(color);
	}
	return color;
}

struct R3FragmentOutput {
	@location(0) color: vec4f,
	@location(1) id: u32,
}