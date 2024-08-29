const linearRGBToDisplayP3Matrix = mat3x3f(
        0.822462, 0.033194, 0.017083,
        0.177538, 0.966806, 0.072397,
        0.000000, 0.000000, 0.910520
    );
fn linearRGBToLinearDisplayP3(linearRGB: vec3f) -> vec3f {
    return linearRGBToDisplayP3Matrix * linearRGB;
}