struct VertexOut {
	@builtin(position) position: vec4f,
	@location(0) ls_pos: vec3f,
	@location(1) normal: vec3f
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

@fragment
fn fragment_main(@builtin(front_facing) front_facing: bool, vertexData: VertexOut) -> R3FragmentOutput {
	let n = normalize(vertexData.normal) * select(-1.0, 1.0, front_facing);
	let color = vec3(clamp(dot(n, normalize(vec3(1,0,0))), 0.0, 1.0));
	let outColor = vec4f(createOutputFragment(color), 1);
	return R3FragmentOutput(outColor, fragmentUniform.id);
}

@fragment
fn fragment_selection() -> @location(0) u32 {
	return fragmentUniform.state;
}