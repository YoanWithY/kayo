fn sRGB_inverseComponentTransferFunction(nonLinearValue: f32) -> f32{
	if (nonLinearValue <= 0.04045) {
        return nonLinearValue / 12.92;
    }
    else {
        return pow((nonLinearValue + 0.055) / 1.055, 2.4);
    }
}
fn sRGB_gammaExpand(gammaCompressedRGB: vec3<f32>) -> vec3<f32> {
    return vec3f(
        sRGB_inverseComponentTransferFunction(gammaCompressedRGB.x),
        sRGB_inverseComponentTransferFunction(gammaCompressedRGB.y),
        sRGB_inverseComponentTransferFunction(gammaCompressedRGB.z));
}