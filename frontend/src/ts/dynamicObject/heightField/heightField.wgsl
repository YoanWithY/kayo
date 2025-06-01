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
	var shadow = 0.0;
	const quality = 0;
	for(var y = -quality; y<=quality; y++) {
		for(var x = -quality; x<=quality; x++) {
			shadow += textureSampleCompare(shadowMap, shadowSampler, shadowUV + vec2f(f32(x), f32(y)) / 4096, shadowNDC.z - 0.003);
		}
	}
	if(any(shadowUV < vec2f(0)) || any(shadowUV > vec2f(1))) {
		return 1;
	}
	return shadow / ((quality * 2 + 1) * (quality * 2 + 1));
}

#include<virtualTexture>

fn toneMapVal(linear: f32) -> f32 {
	if (linear <= 1.0) {
		return 2 * linear / (linear + 1.0);
	}
	return linear / (linear + 1.0) + 0.5;
}

fn toneMap(linear: vec3f) -> vec3f {
	return vec3f(toneMapVal(linear.r), toneMapVal(linear.g), toneMapVal(linear.b));
}

@fragment
fn fragment_main(@builtin(front_facing) front_facing: bool, vertexData: VertexOut) -> R3FragmentOutput {
	let n = normalize(vertexData.normal) * select(-1.0, 1.0, front_facing);
	let l = sun.light.xyz;
	let strength = sun.light.w;
	var light = vec3(clamp(dot(n, l), 0.0, 1.0)) * strength;
	light *= getShadow(vertexData.ws_pos);
	light += 0.1;

	let uv = (vertexData.ws_pos.xy - 2) * 32;

	// let albedo = sRGB_EOTF(virtualTextureSample(0, uv).rgb);
	// let albedo = sRGB_EOTF(textureSample(svt_physical_texture, svt_sampler_ansiotropic, uv * 0.005, 0).rgb);
	let albedo = vec3f(2);
	let outColor = vec4f(createOutputFragment(toneMap(albedo * light)), 1);
	return R3FragmentOutput(outColor, fragmentUniform.id);
}

@fragment
fn fragment_selection() -> @location(0) u32 {
	return fragmentUniform.state;
}