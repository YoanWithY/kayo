struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) ls_pos: vec3f,
	@location(1) normal: vec3f,
	@location(2) ws_pos: vec3f,
}

#include <utility/frame>
#include <utility/r3>

struct HeightField {
	geometryMin: vec2f,
	geometrySize: vec2f,
	domainMin: vec2f,
	domainSize: vec2f,
	xVerts: u32,
	yVerts: u32,
}
@group(2) @binding(0) var<uniform> heightField: HeightField;
@group(2) @binding(1) var heightCache: texture_2d<f32>;
@group(2) @binding(2) var albedoT: texture_2d<f32>;
@group(2) @binding(3) var mineSampler: sampler;

fn mapToLocal(p: vec2f) -> vec2f {
	return p * heightField.geometrySize + heightField.geometryMin;
}

struct Coords {
	norm: vec2f,
	id: vec2u
}

fn getNormalized(index: u32) -> Coords {
	let vertsPerRow = heightField.xVerts * 2u;
	let vertsPerRowWithNaN = vertsPerRow + 2u;

	let nanVertices: u32 = 2 * (index / vertsPerRowWithNaN);
	var vIndex: u32 = index - nanVertices;

	let indexInRowWithNaN: u32 = index % vertsPerRowWithNaN;
	if(indexInRowWithNaN >= vertsPerRow) {
		vIndex -= 1;
	}

	let row: u32 = vIndex / vertsPerRow;
	let indexInRow: u32 = vIndex % vertsPerRow;
	let xInRow: u32 = indexInRow / 2u;
	let upper: u32 = 1u - indexInRow % 2u;
	let yInColumn = row + upper;

	let xNorm = f32(xInRow) / f32(heightField.xVerts - 1);
	let yNorm = f32(yInColumn) / f32(heightField.yVerts - 1);
	return Coords(vec2f(xNorm, yNorm), vec2u(xInRow, yInColumn));
}

@vertex
fn vertex_main(@builtin(vertex_index) index: u32) -> VertexOut {
	var output: VertexOut;

	let coords = getNormalized(index);
	let data = textureLoad(heightCache, coords.id, 0);
	 
	let ls_pos = vec3f(mapToLocal(coords.norm), data.w);
	let ws_pos = (vertexUniform.transformation * vec4f(ls_pos, 1)).xyz;

	output.position = view.projectionMat * view.viewMat * vec4f(ws_pos, 1);
	output.ls_pos = ls_pos;

	let normMat: mat3x3<f32> = mat3x3<f32>(
		vertexUniform.transformation[0].xyz,
		vertexUniform.transformation[1].xyz,
		vertexUniform.transformation[2].xyz
	);
	output.normal = normMat * data.xyz;
	output.ws_pos = ws_pos;
	return output;
}

@vertex
fn vertex_geometry(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let coords = getNormalized(index);
	let data = textureLoad(heightCache, coords.id, 0);

	let ls_pos = vec3f(mapToLocal(coords.norm), data.w);
	let ws_pos = (vertexUniform.transformation * vec4f(ls_pos, 1)).xyz;

	return view.projectionMat * view.viewMat * vec4f(ws_pos, 1);;
}

#include <utility/fragmentOutput>

fn steps(v: vec3f, stepSize: f32) -> vec3f {
	return floor(v / stepSize) * stepSize;
}

struct Sun {
	matrix: mat4x4f,
	light: vec4f
}
 @group(3) @binding(0) var<uniform> sun: Sun;
 @group(3) @binding(1) var shadowMap: texture_depth_2d;
 @group(3) @binding(2) var shadowSampler: sampler_comparison;
fn getShadow(ws_pos: vec3f) -> f32 {
	var shadowNDC = (sun.matrix * vec4f(ws_pos, 1.0));
	var shadowUV =  shadowNDC.xy * vec2f(0.5, -0.5) + 0.5;
	var shadow = textureSampleCompare(shadowMap, shadowSampler, shadowUV, shadowNDC.z - 0.0003);
	if(any(shadowUV < vec2f(0)) || any(shadowUV > vec2f(1))) {
		return 1;
	}
	return shadow;
}

fn xor(a: bool, b: bool) -> bool {
	return (a || b) && !(a && b);
}

fn checkerBoard(uv: vec2f) -> f32 {
    let uvM = fract(uv / 2.0);
    return select(0.0, 1.0, xor((uvM.x < 0.5), (uvM.y < 0.5)));
}

fn queryMipLevel(texture: texture_2d<f32>, uv: vec2<f32>) -> f32 {
    let scaledUV = uv * vec2f(textureDimensions(texture).xy);
    let dx = dpdxFine(scaledUV);
    let dy = dpdyFine(scaledUV);
	let dmax = max(dot(dx, dx), dot(dy, dy));
    return 0.5 * log2(dmax);
}

fn mineSample(texture: texture_2d<f32>, uv: vec2f) -> vec4f {
	let mipLevel = queryMipLevel(texture, uv);
	let texSize = textureDimensions(texture, 0).xy;
	let texSizei = vec2i(texSize);
	let uvT = uv * vec2f(texSize);
	let f = fract(uvT);
	let p = vec2i(floor(uvT));
	let w = fwidth(uvT) * 0.9;
    let a = clamp(1.0 - (abs(fract(uvT - 0.5) - 0.5) / w - (0.5 - 1.0)), vec2f(0), vec2f(1));

	let xOff = select(vec2i(-1, 0), vec2i(1, 0), f.x >= 0.5);
	let yOff = select(vec2i(0, -1), vec2i(0, 1), f.y >= 0.5);
	let thisSample = textureLoad(texture, p % texSizei, 0);
	let otherX = textureLoad(texture, (p + xOff) % texSizei, 0);
	let otherY = textureLoad(texture, (p + yOff) % texSizei, 0);
	let otherXY = textureLoad(texture, (p + xOff + yOff) % texSizei, 0);
	let directSample = textureSample(texture, mineSampler, uv);
	let analyticSample = mix(mix(thisSample, otherX, a.x), mix(otherY, otherY, a.x), a.y);
	if(mipLevel < 1.0) {
		return mix(analyticSample, directSample, max(mipLevel, 0));
	}
	return directSample;
}

@fragment
fn fragment_main(@builtin(front_facing) front_facing: bool, vertexData: VertexOut) -> R3FragmentOutput {
	let n = normalize(vertexData.normal) * select(-1.0, 1.0, front_facing);
	let l = sun.light.xyz;
	let strength = sun.light.w;
	var light = vec3(clamp(dot(n, l), 0.0, 1.0)) * strength;
	light *= getShadow(vertexData.ws_pos);
	light += 0.1;

	let uv = vertexData.ws_pos.xy;
	let albedo = sRGB_EOTF(mineSample(albedoT, uv).rgb);
	let outColor = vec4f(createOutputFragment(light * albedo.rgb), 1);
	return R3FragmentOutput(outColor, fragmentUniform.id);
}

@fragment
fn fragment_selection() -> @location(0) u32 {
	return fragmentUniform.state;
}