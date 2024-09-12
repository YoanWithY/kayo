fn sRGB_componentOETF(linearValue: f32) -> f32 {
    if(linearValue < 0.0) {
        return 0.0;
    }
    if (linearValue <= 0.0031308) {
        return 12.92 * linearValue;
    }
    // else if(linearValue > 1.0) {
    //     let linearValue = 0.25 * linearValue + 0.75;
    //     let a = 0.17883277;
    //     let b = 1.0 - 4.0 * a;
    //     let c = 0.5 - a * log(4.0 * a);
    //     return 2.0 * (a * log(linearValue - b) + c);
    // }
    return 1.055 * pow(linearValue, 1.0 / 2.4) - 0.055;
    
}

fn sRGB_OETF(linearRGB: vec3f) -> vec3f {
    return vec3f(
        sRGB_componentOETF(linearRGB.x),
        sRGB_componentOETF(linearRGB.y),
        sRGB_componentOETF(linearRGB.z));
}