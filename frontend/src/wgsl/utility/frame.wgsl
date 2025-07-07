override output_color_space: u32;			// 0: sRGB; 1: Display-P3
override use_color_quantisation: u32; 		// 0: off, else on
override use_dithering: u32; 				// 0: off, else on
override output_component_transfere: u32;	// 0: none; 1: sRGB

const linear_rgb_to_display_p3_mat = mat3x3f(
        0.822462, 0.033194, 0.017083,
        0.177538, 0.966806, 0.072397,
        0.000000, 0.000000, 0.910520
    );

struct View {
	view_mat: mat4x4f,
	projection_mat: mat4x4f,
	camera_mat: mat4x4f,
	projection_data: vec4f, // [0] near clipping plane; [1] far clipping plane; [2] dpr
	color_data: vec4f, // [0] exposure, [1] gamma, [2] (uint): number of color to qunatize to 
	viewport: vec4u,
	frame: vec4u
}

struct R3FragmentOutput {
	@location(0) color: vec4f,
	@location(1) id: u32,
}

@group(0) @binding(0) var<uniform> view: View;
@group(0) @binding(1) var blue_noise_texture : texture_2d<u32>;
const blue_noise_max_value: u32 = 65535;


fn getCameraPosition() -> vec3f {
	return view.camera_mat[3].xyz;
}
fn getNear() -> f32 {
	return view.projection_data[0];
}

fn getFar() -> f32 {
	return view.projection_data[1];
}

fn getDPR() -> f32 {
	return view.projection_data[2];
}

fn convertToTargetColorSpace(linear_rgb: vec3f) -> vec3f {
	if(output_color_space == 1) {
		return linear_rgb_to_display_p3_mat * linear_rgb;
	}
	return linear_rgb;
}

fn sRGB_componentEOTF(non_linear_value: f32) -> f32{
	if (non_linear_value <= 0.04045) {
        return non_linear_value / 12.92;
    }
    else {
        return pow((non_linear_value + 0.055) / 1.055, 2.4);
    }
}
fn sRGB_EOTF(non_linear_rgb: vec3<f32>) -> vec3<f32> {
    return vec3f(
        sRGB_componentEOTF(non_linear_rgb.x),
        sRGB_componentEOTF(non_linear_rgb.y),
        sRGB_componentEOTF(non_linear_rgb.z));
}

fn sRGB_componentOETF(linear_value: f32) -> f32 {
    if (linear_value <= 0.0031308) {
        return max(12.92 * linear_value, 0.0);
    }
    return 1.055 * pow(linear_value, 1.0 / 2.4) - 0.055;
}

fn sRGB_OETF(linear_rgb: vec3f) -> vec3f {
    return vec3f(
        sRGB_componentOETF(linear_rgb.x),
        sRGB_componentOETF(linear_rgb.y),
        sRGB_componentOETF(linear_rgb.z));
}

fn applyCustomQuantisation(final_color: vec3f, frag_coord: vec2u) -> vec3f {
	if (use_color_quantisation == 0) {
		return final_color;
	}
	let factor = view.color_data[2] - 1;
	var scaled = final_color * factor;
	if (use_dithering != 0) {
		let pixel_coord: vec2u = vec2u(frag_coord) % textureDimensions(blue_noise_texture, 0);
		let blue_noise_value = f32(textureLoad(blue_noise_texture, pixel_coord, 0).x) / f32(blue_noise_max_value + 1);
		scaled += vec3f(blue_noise_value - 0.49999);
	}
	return round(scaled) / factor;
	
}

fn createOutputFragment(linear_rgb: vec3f, frag_coord: vec2u) -> vec3f {
	let exposure_applied = linear_rgb * pow(2.0, view.color_data[0]);
	let color = convertToTargetColorSpace(exposure_applied);
	let oe_color = select(color, sRGB_OETF(color), output_component_transfere == 1);
	let final_high_res_color = pow(oe_color, vec3f(1.0 / view.color_data[1]));
	return applyCustomQuantisation(final_high_res_color, frag_coord);
}
