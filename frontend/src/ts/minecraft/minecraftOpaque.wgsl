struct VertexIn {
	@location(0) origin: vec3f,
	@location(1) tangent: vec3f,
	@location(2) bitangent: vec3f,
	@location(3) tcMin: vec2f,
	@location(4) tcMax: vec2f,
	@location(5) textureIndex: u32,
	@builtin(vertex_index) vertexID: u32
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) @interpolate(flat) normal: vec3f,
    @location(1) @interpolate(flat) tangent: vec3f,
    @location(2) @interpolate(flat) bitangent: vec3f,
    @location(3) @interpolate(flat) textureIndex: u32,
	@location(4) tc: vec2f,
	@location(5) uTC: vec2f,
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
	var tc = vertex.tcMin;
	let deltaTC = vertex.tcMax - vertex.tcMin;
	if(uTC.x == 1) {
		ls_pos += vertex.tangent;
		tc.x += deltaTC.x;
	}
	if(uTC.y == 1) {
		ls_pos += vertex.bitangent;
		tc.y += deltaTC.y;
	}
	var round = round(ls_pos);
	if(all(abs(round-ls_pos) < vec3f(0.001))) {
		ls_pos = round;
	}
	let cs_pos = (view.viewMat * vec4f(ls_pos, 1.0)).xyz;
	let out_pos = view.projectionMat * vec4f(cs_pos, 1.0);
	let normal = normalize(cross(vertex.tangent, vertex.bitangent));
	return VertexOut(out_pos, normal, vertex.tangent, vertex.bitangent, vertex.textureIndex, tc, uTC);
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
	let uvT = uv * vec2f(texSize);
	let f = fract(uvT);
	let p = vec2i(floor(uvT));
	let w = fwidth(uvT) * 1.0;
    var a = clamp(1.0 - (abs(fract(uvT - 0.5) - 0.5) / w - (0.5 - 1.0)), vec2f(0), vec2f(1));
	let uTCa = clamp(1.0 - (abs(fract(uTC - 0.5) - 0.5) / fwidth(uTC)), vec2f(0), vec2f(1));

	let xOff = select(vec2i(-1, 0), vec2i(1, 0), f.x >= 0.5);
	let yOff = select(vec2i(0, -1), vec2i(0, 1), f.y >= 0.5);
	let thisSample = textureLoad(textures, clamp(p, vec2i(0), texSizei - 1), layer, 0);
	let otherX = textureLoad(textures, clamp(p + xOff, vec2i(0), texSizei - 1), layer, 0);
	let otherY = textureLoad(textures, clamp(p + yOff, vec2i(0),  texSizei - 1), layer, 0);
	let otherXY = textureLoad(textures, clamp(p + xOff + yOff, vec2i(0), texSizei - 1), layer, 0);
	let directSample = textureSample(textures, textureSampler, uv, layer);

	let analyticSample = mix(mix(thisSample, otherX, a.x), mix(otherY, otherY, a.x), a.y);
	if(mipLevel < 1.0) {
		return mix(analyticSample, directSample, max(mipLevel, 0));
	}
	return directSample;
}

#include <utility/fragmentOutput>
@fragment
fn fragment_main(fragment: VertexOut) -> R3FragmentOutput {
	let light = vec3f(abs(dot(fragment.normal, vec3(.9, .3, .1))));
	let albedo = sRGB_EOTF(mineSample(fragment.textureIndex, fragment.tc, fragment.uTC).rgb);
	// let albedo = vec3f(1);
	let outColor = vec4f(createOutputFragment(albedo * light), 1);
	return R3FragmentOutput(outColor, 1);
}