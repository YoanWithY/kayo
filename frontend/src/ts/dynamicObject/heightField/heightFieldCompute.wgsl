struct HeightField {
	geometryMin: vec2f,
	geometrySize: vec2f,
	domainMin: vec2f,
	domainSize: vec2f,
	xVerts: u32,
	yVerts: u32,
}

const epsilon = 0.01;

#include <utility/frame>

@group(1) @binding(0) var<uniform> heightField: HeightField;
@group(1) @binding(1) var cacheTexture: texture_storage_2d<rgba32float, write>;

fn hf(arg: vec2f) -> f32 {
	#heightCode
}

fn mapToDomain(norm: vec2f) -> vec2f {
	return norm * heightField.domainSize + heightField.domainMin;
}

fn mapToLocal(p: vec2f) -> vec2f {
	return p * heightField.geometrySize + heightField.geometryMin;
}

@compute @workgroup_size(8, 8, 1) fn computeHeight(@builtin(global_invocation_id) id: vec3u) {
	if(id.x >= heightField.xVerts || id.y >= heightField.yVerts) {
		return;
	}
	let norm = vec2f(id.xy) / (vec2f(vec2u(heightField.xVerts, heightField.yVerts)) - 1);
	let dom0 = mapToDomain(norm);
	let p0 = vec3f(mapToLocal(norm), hf(dom0));
	let p1 = vec3f(mapToLocal(norm) + vec2f(epsilon, 0), hf(dom0 + vec2f(epsilon / heightField.geometrySize.x, 0)));
	let p2 = vec3f(mapToLocal(norm) + vec2f(0, epsilon), hf(dom0 + vec2f(0, epsilon / heightField.geometrySize.y)));

	let t = p1 - p0;
	let b = p2 - p0;
	let n = normalize(cross(t, b));
	textureStore(cacheTexture, id.xy, vec4f(n, p0.z));
}