#include <utility/fullScreenQuadVertex>

@group(0) @binding(0) var textureMS: texture_multisampled_2d<u32>;

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) #vectorFormat {
	return #vectorFormat(textureLoad(textureMS, vec2i(position.xy), 0).#vectorSelector);
}