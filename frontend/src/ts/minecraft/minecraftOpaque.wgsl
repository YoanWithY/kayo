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

@group(2) @binding(0) var textures: texture_2d_array<f32>;
@group(2) @binding(1) var textureSampler: sampler;

fn queryMipLevel(uv: vec2<f32>) -> f32 {
    let scaledUV = uv * vec2f(textureDimensions(textures).xy);
    let dx = dpdxFine(scaledUV);
    let dy = dpdyFine(scaledUV);
	let dmax = max(dot(dx, dx), dot(dy, dy));
    return 0.5 * log2(dmax);
}
fn mineSample(layer: u32, uv: vec2f, uTC: vec2f) -> vec4f {
	let mipLevel = queryMipLevel(uv);
	let texSize = textureDimensions(textures, 0).xy;
	let texSizei = vec2i(texSize);
	let texSizei1 = texSizei - 1;
	let uvT = uv * vec2f(texSize);
	let f = fract(uvT);
	let p = vec2i(floor(uvT));
	let w = fwidth(uvT) * 0.7;
    var a = clamp(1.0 - (abs(fract(uvT - 0.5) - 0.5) / w - (0.5 - 1.0)), vec2f(0), vec2f(1));
	let uTCa = clamp(1.0 - (abs(fract(uTC - 0.5) - 0.5) / fwidth(uTC)), vec2f(0), vec2f(1));

	let xOff = select(select(vec2i(-1, 0), vec2i(1, 0), f.x >= 0.5), vec2i(0), uTCa.x > 0);
	let yOff = select(select(vec2i(0, -1), vec2i(0, 1), f.y >= 0.5), vec2i(0), uTCa.y > 0);
	var thisSample = textureLoad(textures, clamp(p, vec2i(0), texSizei1), layer, 0);
	var otherX = textureLoad(textures, clamp(p + xOff, vec2i(0), texSizei1), layer, 0);
	var otherY = textureLoad(textures, clamp(p + yOff, vec2i(0),  texSizei1), layer, 0);
	var otherXY = textureLoad(textures, clamp(p + xOff + yOff, vec2i(0), texSizei1), layer, 0);
	let directSample = textureSample(textures, textureSampler, uv, layer);

	if(thisSample.a == 1) {
		if(otherX.a == 0) {
			otherX = vec4f(thisSample.rgb, otherX.a);
		}
		if(otherY.a == 0) {
			otherY = vec4f(thisSample.rgb, otherY.a);
		}
	}

	if(thisSample.a == 0) {
		if(otherX.a == 1) {
			if(otherY.a == 1) {
				thisSample = select(vec4f(otherX.rgb, thisSample.a), vec4f(otherY.rgb, thisSample.a), a.y > a.x);
			} else {
				thisSample = vec4f(otherX.rgb, thisSample.a);
			}
		} else if(otherY.a == 1) {
			thisSample = vec4f(otherY.rgb, thisSample.a);
		}
	}

	let analyticSample = mix(mix(thisSample, otherX, a.x), mix(otherY, otherY, a.x), a.y);
	if(mipLevel < 1.0) {
		return mix(analyticSample, directSample, max(mipLevel, 0));
	}
	return directSample;
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
	// let albedo = vec3f(fragment.normal);
	let outColor = vec4f(createOutputFragment(albedo * light), albedoAlpha.a);

	return R3FragmentOutput(outColor, 1);
}