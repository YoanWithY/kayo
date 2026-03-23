#include <utility/fullScreenQuadVertex>

@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var mipSampler: sampler;

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	return textureSample(texture, mipSampler, (floor(position.xy) * 2 + 1) / vec2f(textureDimensions(texture, 0)));;
}