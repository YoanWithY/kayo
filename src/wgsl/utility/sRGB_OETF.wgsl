fn sRGB_componentOETF(linearValue: f32) -> f32 {
    if (linearValue <= 0.0031308) {
        return 12.92 * linearValue;
    }
    else {
        return 1.055 * pow(linearValue, 1.0 / 2.4) - 0.055;
    }
}

fn sRGB_OETF(linearRGB: vec3<f32>) -> vec3<f32> {
    return vec3f(
        sRGB_componentOETF(linearRGB.x),
        sRGB_componentOETF(linearRGB.y),
        sRGB_componentOETF(linearRGB.z));
}