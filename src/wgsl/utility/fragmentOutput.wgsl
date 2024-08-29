#include <utility/linearRGBToLinearDisplayP3>
#include <utility/sRGB_gammaExpansion>
#include <utility/sRGB_gammaCompression>

override targetColorSpace: i32; // 0: sRGB; 1: Display-P3
override componentTranfere: i32; // 0: none: sRGB

fn convertToTargetColorSpace(linearRGB: vec3f) -> vec3f {
	if(targetColorSpace == 1) {
		return linearRGBToLinearDisplayP3(linearRGB);
	}
	return linearRGB;
}

fn createOutputFragment(linearRGB: vec3f) -> vec3f {
	var color = convertToTargetColorSpace(linearRGB);
	if(componentTranfere == 1) {
		return sRGB_gammaCompress(color);
	}
	return color;
}