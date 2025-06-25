#include <utility/linearRGBToLinearDisplayP3>
override outputColorSpace: i32; // 0: sRGB; 1: Display-P3
fn convertToTargetColorSpace(linearRGB: vec3f) -> vec3f {
	if(outputColorSpace == 1) {
		return linearRGBToLinearDisplayP3(linearRGB);
	}
	return linearRGB;
}