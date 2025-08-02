struct VertexIn {
	@location(0) origin: vec3f,
	@location(1) tangent: vec3f,
	@location(2) bitangent: vec3f,
	@location(3) tc_origin: vec2f,
	@location(4) tc_tangent: vec2f,
	@location(5) tc_bitangent: vec2f,
	@location(6) texture_index: u32,
	@location(7) tint: u32,
	@builtin(vertex_index) vertex_id: u32
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) @interpolate(flat) normal: vec3f,
    @location(1) @interpolate(flat) tangent: vec3f,
    @location(2) @interpolate(flat) bitangent: vec3f,
    @location(3) @interpolate(flat) texture_index: u32,
    @location(4) @interpolate(flat) tint: u32,
	@location(5) tc: vec2f,
	@location(6) u_tc: vec2f,
};

struct Section {
	position: vec3f
};

#include <utility/frame>
#include <virtualTexture>
@group(1) @binding(0) var<uniform> section: Section;
@vertex
fn vertex_main(vertex: VertexIn) -> VertexOut {
	let u_tc = vec2f(f32(vertex.vertex_id / 2), f32(vertex.vertex_id % 2));
	var ls_pos = vertex.origin + section.position;
	var tc = vertex.tc_origin;
	if(u_tc.x == 1) {
		ls_pos += vertex.tangent;
		tc += vertex.tc_tangent;
	}
	if(u_tc.y == 1) {
		ls_pos += vertex.bitangent;
		tc += vertex.tc_bitangent;
	}
	ls_pos = ls_pos.zxy;
	let ls_scaled = ls_pos * 16.0;
	var round = round(ls_scaled);
	if(all(abs(round - ls_scaled) < vec3f(0.001))) {
		ls_pos = round / 16.0;
	}
	let cs_pos = (view.view_mat * vec4f(ls_pos, 1.0)).xyz;
	let out_pos = view.projection_mat * vec4f(cs_pos, 1.0);

	let tangent = vertex.tangent.zxy;
	let bitangent = vertex.bitangent.zxy;
	let normal = normalize(cross(bitangent, tangent));
	return VertexOut(out_pos, normal, vertex.tangent, vertex.bitangent, vertex.texture_index, vertex.tint, tc, u_tc);
}

// fn mineSample(v_id: u32, uv: vec2f, u_tc: vec2f) -> vec4f {
// 	let info = virtualTextureInfo(v_id);
// 	let tex_size = vec2u(info.width, info.height);
// 	let uv_t = uv * vec2f(tex_size);
// 	let mip_level = virtualTextureQueryLevel(dpdxFine(uv_t), dpdyFine(uv_t), false);

// 	let tex_sizei_1 = vec2u(tex_size - 1);
// 	let f = fract(uv_t);
// 	let p = vec2i(floor(uv_t));
// 	let w = fwidth(uv_t) * 0.7071;
//     var a = clamp(1.0 - (abs(fract(uv_t - 0.5) - 0.5) / w - (0.5 - 1.0)), vec2f(0), vec2f(1));
// 	let u_tca = clamp(1.0 - (abs(fract(u_tc - 0.5) - 0.5) / fwidth(u_tc)), vec2f(0), vec2f(1));

// 	let direct_sample = virtualTextureSample(v_id, uv);
// 	if(mip_level > 0) {
// 		if(mip_level >= 1) {
// 			return direct_sample;
// 		}
// 	}

// 	let x_off = select(select(vec2i(-1, 0), vec2i(1, 0), f.x >= 0.5), vec2i(0), u_tca.x > 0);
// 	let y_off = select(select(vec2i(0, -1), vec2i(0, 1), f.y >= 0.5), vec2i(0), u_tca.y > 0);

// 	let tile_coord = virtualTextureMipAtlasCoordinate(v_id);
// 	var samples = virtualTextureGather4Fast(
// 		clamp(vec2u(p), vec2u(0), tex_sizei_1),
// 		clamp(vec2u(p + x_off), vec2u(0), tex_sizei_1),
// 		clamp(vec2u(p + y_off), vec2u(0),  tex_sizei_1),
// 		clamp(vec2u(p + x_off + y_off), vec2u(0), tex_sizei_1),
// 		0,
// 		info.sampling_data,
// 		tile_coord);

// 	if(samples[0].a == 1) {
// 		if(samples[1].a == 0) {
// 			samples[1] = vec4f(samples[0].rgb, samples[1].a);
// 		}
// 		if(samples[2].a == 0) {
// 			samples[2] = vec4f(samples[0].rgb, samples[2].a);
// 		}
// 	}

// 	if(samples[0].a == 0) {
// 		if(samples[1].a == 1) {
// 			if(samples[2].a == 1) {
// 				samples[0] = select(vec4f(samples[1].rgb, samples[0].a), vec4f(samples[2].rgb, samples[0].a), a.y > a.x);
// 			} else {
// 				samples[0] = vec4f(samples[1].rgb, samples[0].a);
// 			}
// 		} else if(samples[2].a == 1) {
// 			samples[0] = vec4f(samples[2].rgb, samples[0].a);
// 		}
// 	}

// 	let analytic_sample = mix(mix(samples[0], samples[1], a.x), mix(samples[2], samples[3], a.x), a.y);
// 	return mix(analytic_sample, direct_sample, max(mip_level, 0));
// }

fn mineSample(v_id: u32, uv: vec2f, u_tc: vec2f) -> vec4f {
	return virtualTextureSample(v_id, uv);
}

@fragment
fn fragment_main(fragment: VertexOut) -> R3FragmentOutput {
	let pixel_coord: vec2u = vec2u(fragment.position.xy);
	let light = vec3f(abs(dot(fragment.normal, vec3(.3, .1, .9))));
	let albedo_alpha = mineSample(fragment.texture_index, fragment.tc, fragment.u_tc);

	// if(albedo_alpha.a < 0.01) {
	// 	discard;
	// }
	var albedo = albedo_alpha.rgb;
	if(fragment.tint != 0) {
		albedo = albedo_alpha.rgb * vec3f(0.57, 0.74, 0.35);
	}
	albedo = sRGB_EOTF(albedo_alpha.rgb);

	let ou_tcolor = createOutputFragment(vec4f(albedo * light, albedo_alpha.a), pixel_coord, true);

	return R3FragmentOutput(ou_tcolor, 1);
}