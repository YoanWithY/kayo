struct VertexIn {
	@builtin(vertex_index) index: u32,
}

struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) normal: vec3f
}

const xVerts = 20u;
const yVerts = 20u;
const vertsPerRow = xVerts * 2u;
const vertsPerRowWithNaN = vertsPerRow + 1u;
const nanValue: f32 = f32(bitcast<u32>(0x7fc00000));

const x_min = -1.0;
const x_max = 1.0;
const y_min = -1.0;
const y_max = 1.0;
const width = (x_max - x_min);
const height = (y_max - y_min);
const epsilon = 0.0001;

fn hf(p: vec2f) -> f32 {
	return sin(p.x * 4.0) * sin(p.y * 4.0);
}

fn pos(p: vec2f) -> vec3f {
	return vec3f(p, hf(p));
}

fn map(x: f32, y: f32) -> vec2f {
	return vec2f(x * width + x_min, y * height + y_min);
}

@vertex
fn vertex_main(
	input: VertexIn) -> VertexOut {
		var output: VertexOut;
		let indexInRowWithNaN = input.index % vertsPerRowWithNaN;
		if(indexInRowWithNaN == vertsPerRow) {
			return VertexOut(vec4f(nanValue), vec3f(nanValue));
		}
		let nanVertices = input.index / vertsPerRowWithNaN;
		let vIndex: u32 = input.index - nanVertices;

		let row: u32 = vIndex / vertsPerRow;
		let indexInRow: u32 = vIndex % vertsPerRow;
		let xInRow: u32 = indexInRow / 2u;
		let upper: u32 = indexInRow % 2u;

		let xNorm = f32(xInRow) / f32(xVerts - 1);
		let yNorm = f32(row + upper) / f32(yVerts - 1);

		let p0 = pos(map(xNorm, yNorm));
		let p1 = pos(map(xNorm + epsilon, yNorm));
		let p2 = pos(map(xNorm, yNorm + epsilon));
		
		output.position.x = p0.x;
		output.position.y = p0.y;
		output.position.z = 0;
		output.position.w = 1.0;
		output.normal = normalize(cross(p1 - p0, p2 - p0));
		return output;
}

#include <utility/fragmentOutput>

@group(0) @binding(0) var myTexture: texture_2d<f32>;
@group(0) @binding(1) var mySampler: sampler;
@fragment
fn fragment_main(vertexData: VertexOut) -> @location(0) vec4f {
	return vec4f(createOutputFragment(vec3f(2.0 * dot(normalize(vertexData.normal), vec3(0.0,0.0,1.0)))), 1);
}