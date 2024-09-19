struct VertexIn {
	@builtin(vertex_index) index: u32,
}

struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) ls_pos: vec3f,
	@location(1) normal: vec3f
}

#include <utility/frame>
#include <utility/r3>

const xVerts = 1000u;
const yVerts = 1000u;
const vertsPerRow = xVerts * 2u;
const vertsPerRowWithNaN = vertsPerRow + 2u;

const geometryMin = vec2f(-10);
const geometrySize = vec2f(20);
const domainMin = vec2f(-10);
const domainSize = vec2f(20);
const epsilon = 0.0001;

fn hf(p: vec2f) -> f32 {
	return sin(p.x + 0.1 * f32(view.frame.x)) * sin(p.y);
}

fn pos(p: vec2f) -> vec3f {
	return vec3f(p, hf(p));
}

fn mapToDomain(x: f32, y: f32) -> vec2f {
	return vec2f(x, y) * domainSize + domainMin;
}

fn mapToLocal(x: f32, y: f32) -> vec2f {
	return vec2f(x, y) * geometrySize + geometryMin;
}

fn getNormalized(input: VertexIn) -> vec2f {
	let nanVertices = 2 * (input.index / vertsPerRowWithNaN);
	var vIndex: u32 = input.index - nanVertices;

	let indexInRowWithNaN = input.index % vertsPerRowWithNaN;
	if(indexInRowWithNaN >= vertsPerRow) {
		vIndex -= 1;
	}

	let row: u32 = vIndex / vertsPerRow;
	let indexInRow: u32 = vIndex % vertsPerRow;
	let xInRow: u32 = indexInRow / 2u;
	let upper: u32 = indexInRow % 2u;

	let xNorm = f32(xInRow) / f32(xVerts - 1);
	let yNorm = f32(row + upper) / f32(yVerts - 1);
	return vec2f(xNorm, yNorm);
}

@vertex
fn vertex_main(input: VertexIn) -> VertexOut {
	var output: VertexOut;
	
	let norm = getNormalized(input);

	let domP0 = pos(mapToDomain(norm.x, norm.y));
	let domP1 = pos(mapToDomain(norm.x + epsilon, norm.y));
	let domP2 = pos(mapToDomain(norm.x, norm.y + epsilon));
	let ls_pos = vec3f(mapToLocal(norm.x, norm.y), domP0.z);
	let ws_pos = (vertexUniform.transformation * vec4f(ls_pos, 1)).xyz;

	output.position = view.projectionMat * view.viewMat * vec4f(ws_pos, 1);
	output.ls_pos = ls_pos;
	output.normal = normalize(cross(domP2 - domP0, domP1 - domP0));

	let normMat: mat3x3<f32> = mat3x3<f32>(
		vertexUniform.transformation[0].xyz,
		vertexUniform.transformation[1].xyz,
		vertexUniform.transformation[2].xyz
	);
	output.normal = normMat * output.normal;
	return output;
}

@vertex
fn vertex_geometry(input: VertexIn) -> @builtin(position) vec4f {
	let norm = getNormalized(input);
	let domP0 = pos(mapToDomain(norm.x, norm.y));
	let ls_pos = vec3f(mapToLocal(norm.x, norm.y), domP0.z);
	let ws_pos = (vertexUniform.transformation * vec4f(ls_pos, 1)).xyz;
	return view.projectionMat * view.viewMat * vec4f(ws_pos, 1);;
}

#include <utility/fragmentOutput>

fn steps(v: vec3f, stepSize: f32) -> vec3f {
	return floor(v / stepSize) * stepSize;
}

@fragment
fn fragment_main(@builtin(front_facing) front_facing: bool, vertexData: VertexOut) -> R3FragmentOutput {
	let n = normalize(vertexData.normal) * select(-1.0, 1.0, front_facing);
	let color = vec3(clamp(dot(n, vec3(1,0,0)), 0.0, 1.0));
	let outColor = vec4f(createOutputFragment(color), 1);
	return R3FragmentOutput(outColor, fragmentUniform.id);
}

@fragment
fn fragment_selection() -> @location(0) u32 {
	return fragmentUniform.state;
}