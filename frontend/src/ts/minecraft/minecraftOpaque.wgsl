struct VertexIn {
	@location(0) origin: vec3f,
	@location(1) tangent: vec3f,
	@location(2) bitangent: vec3f,
	@location(3) tcOrigin: vec2f,
	@location(4) tcTangent: vec2f,
	@location(5) tcBitangent: vec2f,
	@location(6) textureIndex: u32,
	@location(7) tint: u32,
	@builtin(vertex_index) vertexID: u32
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) @interpolate(flat) normal: vec3f,
    @location(1) @interpolate(flat) tangent: vec3f,
    @location(2) @interpolate(flat) bitangent: vec3f,
    @location(3) @interpolate(flat) textureIndex: u32,
    @location(4) @interpolate(flat) tint: u32,
	@location(5) tc: vec2f,
	@location(6) uTC: vec2f,
};

struct Section {
	position: vec3f
};

#include <utility/frame>
#include <virtualTexture>
@group(1) @binding(0) var<uniform> section: Section;
@vertex
fn vertex_main(vertex: VertexIn) -> VertexOut {
	let uTC = vec2f(f32(vertex.vertexID / 2), f32(vertex.vertexID % 2));
	var ls_pos = vertex.origin + section.position;
	var tc = vertex.tcOrigin;
	if(uTC.x == 1) {
		ls_pos += vertex.tangent;
		tc += vertex.tcTangent;
	}
	if(uTC.y == 1) {
		ls_pos += vertex.bitangent;
		tc += vertex.tcBitangent;
	}
	ls_pos = ls_pos.zxy;
	let ls_scaled = ls_pos * 16.0;
	var round = round(ls_scaled);
	if(all(abs(round - ls_scaled) < vec3f(0.001))) {
		ls_pos = round / 16.0;
	}
	let cs_pos = (view.viewMat * vec4f(ls_pos, 1.0)).xyz;
	let out_pos = view.projectionMat * vec4f(cs_pos, 1.0);

	let tangent = vertex.tangent.zxy;
	let bitangent = vertex.bitangent.zxy;
	let normal = normalize(cross(bitangent, tangent));
	return VertexOut(out_pos, normal, vertex.tangent, vertex.bitangent, vertex.textureIndex, vertex.tint, tc, uTC);
}

fn mineSample(v_id: u32, uv: vec2f, uTC: vec2f) -> vec4f {
	let id_coord = virtualTextureIDCoordinate(v_id);
	let info = virtualTextureInfo(id_coord);
	let tex_size = virtualTextureDimensions(info);
	let uv_t = uv * vec2f(tex_size);
	let mip_level = virtualTextureQueryLevel(dpdxFine(uv_t), dpdyFine(uv_t), false);

	let tex_sizei_1 = vec2u(tex_size - 1);
	let f = fract(uv_t);
	let p = vec2i(floor(uv_t));
	let w = fwidth(uv_t) * 0.7071;
    var a = clamp(1.0 - (abs(fract(uv_t - 0.5) - 0.5) / w - (0.5 - 1.0)), vec2f(0), vec2f(1));
	let uTCa = clamp(1.0 - (abs(fract(uTC - 0.5) - 0.5) / fwidth(uTC)), vec2f(0), vec2f(1));

	let direct_sample = virtualTextureSample(v_id, uv);
	if(mip_level > 0) {
		if(mip_level >= 1) {
			return direct_sample;
		}
	}

	let x_off = select(select(vec2i(-1, 0), vec2i(1, 0), f.x >= 0.5), vec2i(0), uTCa.x > 0);
	let y_off = select(select(vec2i(0, -1), vec2i(0, 1), f.y >= 0.5), vec2i(0), uTCa.y > 0);

	let tile_coord = virtualTextureMipAtlasCoordinate(v_id);
	var samples = virtualTextureGather4Fast(
		clamp(vec2u(p), vec2u(0), tex_sizei_1),
		clamp(vec2u(p + x_off), vec2u(0), tex_sizei_1),
		clamp(vec2u(p + y_off), vec2u(0),  tex_sizei_1),
		clamp(vec2u(p + x_off + y_off), vec2u(0), tex_sizei_1),
		0, info, tile_coord);

	if(samples[0].a == 1) {
		if(samples[1].a == 0) {
			samples[1] = vec4f(samples[0].rgb, samples[1].a);
		}
		if(samples[2].a == 0) {
			samples[2] = vec4f(samples[0].rgb, samples[2].a);
		}
	}

	if(samples[0].a == 0) {
		if(samples[1].a == 1) {
			if(samples[2].a == 1) {
				samples[0] = select(vec4f(samples[1].rgb, samples[0].a), vec4f(samples[2].rgb, samples[0].a), a.y > a.x);
			} else {
				samples[0] = vec4f(samples[1].rgb, samples[0].a);
			}
		} else if(samples[2].a == 1) {
			samples[0] = vec4f(samples[2].rgb, samples[0].a);
		}
	}

	let analytic_sample = mix(mix(samples[0], samples[1], a.x), mix(samples[2], samples[3], a.x), a.y);
	return mix(analytic_sample, direct_sample, max(mip_level, 0));
}

// fn mineSample(layer: u32, uv: vec2f, uTC: vec2f) -> vec4f {
// 	return textureSample(textures, textureSampler, uv, layer);;
// }

#include <utility/fragmentOutput>
@fragment
fn fragment_main(fragment: VertexOut) -> R3FragmentOutput {
	let light = vec3f(abs(dot(fragment.normal, vec3(.3, .1, .9))));
	var albedoAlpha = mineSample(fragment.textureIndex, fragment.tc, fragment.uTC);
	if(albedoAlpha.a < 0.01) {
		discard;
	}
	if(fragment.tint != 0) {
		albedoAlpha = vec4f(albedoAlpha.rgb * vec3f(0.57, 0.74, 0.35), albedoAlpha.a);
	}
	let albedo = sRGB_EOTF(albedoAlpha.rgb);
	// let albedo = vec3f(fragment.tc, 0);
	let outColor = vec4f(createOutputFragment(albedo * light), albedoAlpha.a);

	return R3FragmentOutput(outColor, 1);
}