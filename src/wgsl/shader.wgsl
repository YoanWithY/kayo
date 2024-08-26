struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f
}

@vertex
fn vertex_main(
	@location(0) position: vec4f,
	@location(1) color: vec4f) -> VertexOut {
		var output: VertexOut;
		output.position = position;
		output.color = color;
		return output;
}

@vertex
fn vertex_main2(
	@location(0) position: vec4f,
	@location(1) color: vec4f) -> VertexOut {
		return VertexOut(vec4f(position.x * 0.5, position.y * 0.5, position.zw), vec4f(0));
}

fn applyGammaCorrection(linearRGB: vec3<f32>) -> vec3<f32> {
    var gammaCorrectedRGB: vec3<f32>;

    if (linearRGB.x <= 0.0031308) {
        gammaCorrectedRGB.x = 12.92 * linearRGB.x;
    } else {
        gammaCorrectedRGB.x = 1.055 * pow(linearRGB.x, 1.0 / 2.4) - 0.055;
    }

    if (linearRGB.y <= 0.0031308) {
        gammaCorrectedRGB.y = 12.92 * linearRGB.y;
    } else {
        gammaCorrectedRGB.y = 1.055 * pow(linearRGB.y, 1.0 / 2.4) - 0.055;
    }

    if (linearRGB.z <= 0.0031308) {
        gammaCorrectedRGB.z = 12.92 * linearRGB.z;
    } else {
        gammaCorrectedRGB.z = 1.055 * pow(linearRGB.z, 1.0 / 2.4) - 0.055;
    }

    return gammaCorrectedRGB;
}

fn revertGammaCorrection(gammaCorrectedRGB: vec3<f32>) -> vec3<f32> {
    var linearRGB: vec3<f32>;

    if (gammaCorrectedRGB.x <= 0.04045) {
        linearRGB.x = gammaCorrectedRGB.x / 12.92;
    } else {
        linearRGB.x = pow((gammaCorrectedRGB.x + 0.055) / 1.055, 2.4);
    }

    if (gammaCorrectedRGB.y <= 0.04045) {
        linearRGB.y = gammaCorrectedRGB.y / 12.92;
    } else {
        linearRGB.y = pow((gammaCorrectedRGB.y + 0.055) / 1.055, 2.4);
    }

    if (gammaCorrectedRGB.z <= 0.04045) {
        linearRGB.z = gammaCorrectedRGB.z / 12.92;
    } else {
        linearRGB.z = pow((gammaCorrectedRGB.z + 0.055) / 1.055, 2.4);
    }

    return linearRGB;
}

fn linearRGBToLinearDisplayP3(linearRGB: vec3<f32>) -> vec3<f32> {
    let transformationMatrix = mat3x3<f32>(
        0.875905, 0.035332, 0.016382,
        0.122070, 0.964542, 0.063767,
        0.002025, 0.000126, 0.919851
    );
    return transformationMatrix * linearRGB;
}

@fragment
fn fragment_main(vertexData: VertexOut) -> @location(0) vec4f {
		return vec4f(applyGammaCorrection(linearRGBToLinearDisplayP3(revertGammaCorrection(vertexData.color.xyz) * 1.5)), 1);
        // return vertexData.color * 2;
}