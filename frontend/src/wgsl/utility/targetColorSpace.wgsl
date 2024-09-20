#include <utility/linearRGBToLinearDisplayP3>
override targetColorSpace: i32; // 0: sRGB; 1: Display-P3
fn convertToTargetColorSpace(linearRGB: vec3f) -> vec3f {
	if(targetColorSpace == 1) {
		return linearRGBToLinearDisplayP3(linearRGB);
	}
	return linearRGB;
}