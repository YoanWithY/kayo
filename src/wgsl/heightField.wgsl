struct VertexIn {
	@builtin(vertex_index) index: u32,
}

struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) vertex_position: vec3f,
	@location(1) normal: vec3f
}

#include <utility/frame>

const xVerts = 100u;
const yVerts = 100u;
const vertsPerRow = xVerts * 2u;
const vertsPerRowWithNaN = vertsPerRow + 2u;

const x_min = -1.0;
const x_max = 1.0;
const y_min = -1.0;
const y_max = 1.0;
const width = (x_max - x_min);
const height = (y_max - y_min);
const epsilon = 0.0001;

fn hf(p: vec2f) -> f32 {
	return sin(p.x * 8.0 + 0.0 * f32(view.frame.x)) * sin(p.y * 8.0);
}

fn pos(p: vec2f) -> vec3f {
	return vec3f(p, hf(p));
}

fn map(x: f32, y: f32) -> vec2f {
	return vec2f(x * width + x_min, y * height + y_min);
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

		let p0 = pos(map(xNorm, yNorm));
		let p1 = pos(map(xNorm + epsilon, yNorm));
		let p2 = pos(map(xNorm, yNorm + epsilon));
		
		output.position = view.projectionMat * view.viewMat * vec4(p0, 1);
		output.vertex_position = vec3f(xNorm, yNorm, 0.0);
		output.normal = normalize(cross(p2 - p0, p1 - p0));
		return output;
}

#include <utility/fragmentOutput>

fn steps(v: vec3f, stepSize: f32) -> vec3f {
	return floor(v / stepSize) * stepSize;
}

@fragment
fn fragment_main(@builtin(front_facing) front_facing: bool, vertexData: VertexOut) -> @location(0) vec4f {
	let color = 1.5 * vertexData.vertex_position * dot(vec3f(0,0,2), normalize(vertexData.normal * select(-1.0, 1.0, front_facing)));
	return
	vec4f (
		createOutputFragment(
			color
		),
		1);
}