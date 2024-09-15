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

@vertex
fn vertex_main(input: VertexIn) -> VertexOut {
		var output: VertexOut;
		
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

		let domP0 = pos(mapToDomain(xNorm, yNorm));
		let domP1 = pos(mapToDomain(xNorm + epsilon, yNorm));
		let domP2 = pos(mapToDomain(xNorm, yNorm + epsilon));
		let ls_pos = vec3f(mapToLocal(xNorm, yNorm), domP0.z);
		let ws_pos = (vertexUniform.transformation * vec4f(ls_pos, 1)).xyz;

		output.position = view.projectionMat * view.viewMat * vec4f(ws_pos, 1);
		output.ls_pos = ls_pos;
		output.normal = normalize(cross(domP2 - domP0, domP1 - domP0));
		return output;
}

#include <utility/fragmentOutput>

fn steps(v: vec3f, stepSize: f32) -> vec3f {
	return floor(v / stepSize) * stepSize;
}

@fragment
fn fragment_main(@builtin(front_facing) front_facing: bool, vertexData: VertexOut) -> R3FragmentOutput {
	let color = 2 * normalize(vertexData.normal) * select(-1.0, 1.0, front_facing);
	let outColor = vec4f(createOutputFragment(color), 1);
	let selection = createSelection(fragmentUniform.state);
	return R3FragmentOutput(outColor, vec2f(1, 0));
}