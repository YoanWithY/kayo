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

fn linearRGBToDisplayP3(linearRGB: vec3<f32>) -> vec3<f32> {
    // Transformation matrix from linear RGB (sRGB) to Display P3
    let transformationMatrix = mat3x3<f32>(
        0.875905, 0.035332, 0.016382,
        0.122070, 0.964542, 0.063767,
        0.002025, 0.000126, 0.919851
    );

    // Apply the transformation matrix
    var p3Color = transformationMatrix * linearRGB;

    // Convert linear Display P3 to gamma-corrected Display P3
    let threshold = vec3<f32>(0.0031308);
    let lowValue = 12.92 * p3Color;
    let highValue = 1.055 * pow(p3Color, vec3<f32>(1.0 / 2.4)) - vec3<f32>(0.055);
    
    // Blend between lowValue and highValue based on the condition
    p3Color = mix(lowValue, highValue, vec3<f32>(p3Color > threshold));

    return p3Color;
}

@fragment
fn fragment_main(vertexData: VertexOut) -> @location(0) vec4f {
		return vec4f(linearRGBToDisplayP3(vertexData.color.xyz), 1);
}