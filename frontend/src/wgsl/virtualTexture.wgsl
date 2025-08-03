struct SVTTextureEntry {
	width: u32,
	height: u32,
	sampling_data: u32,
	indirection_data: u32,
}

@group(0) @binding(128) var<storage, read> svt_texture_info : array<SVTTextureEntry>;
@group(0) @binding(130) var svt_indirection_table_atlas : texture_2d_array<u32>;
@group(0) @binding(131) var svt_physical_texture : texture_2d_array<f32>;
// mag min
@group(0) @binding(132) var svt_sampler000 : sampler;
@group(0) @binding(133) var svt_sampler001 : sampler;
@group(0) @binding(134) var svt_sampler010 : sampler;
@group(0) @binding(135) var svt_sampler011 : sampler;
@group(0) @binding(136) var svt_sampler100 : sampler;
@group(0) @binding(137) var svt_sampler101 : sampler;
@group(0) @binding(138) var svt_sampler110 : sampler;
@group(0) @binding(139) var svt_sampler111 : sampler;
@group(0) @binding(140) var svt_sampler_ansiotropic : sampler;

// ====== Texture Info Table ====== //

fn virtualTextureInfo(v_id: u32) -> SVTTextureEntry {
	return svt_texture_info[v_id];
}

fn virtualTextureLevelDimensions(size: vec2u, level: u32) -> vec2u {
	return max(size >> vec2u(level), vec2u(1));
}

fn virtualTextureNumLevels(sampling_data: u32) -> u32 {
	return (sampling_data >> 8) & 0xFF;
}

fn virtualTextureFirstAtlasedLevel(sampling_data: u32) -> u32 {
	return sampling_data & 0xFF;
}

fn virtualTextureIndirectionTableAtlasLayer(indirection_data: u32) -> u32 {
	return indirection_data >> 16;
}

fn virtualTextureFiltering(sampling_data: u32) -> u32 {
	return (sampling_data >> 20) & 0xF;
}

fn virtualTextureAnisotropy(sampling_data: u32) -> bool {
	return ((sampling_data >> 23) & 1u) == 1u;
}

fn virtualTextureLinearMipmapFiltering(sampling_data: u32) -> bool {
	return ((sampling_data >> 22) & 1u) == 1u;
}

fn virtualTextureLinearMagFiltering(sampling_data: u32) -> bool {
	return ((sampling_data >> 21) & 1u) == 1u;
}

fn virtualTextureLinearMinFiltering(sampling_data: u32) -> bool {
	return ((sampling_data >> 20) & 1u) == 1u;
}

fn virtualTextureAdressModeU(sampling_data: u32) -> u32 {
	return (sampling_data >> 18) & 3u;
}

fn virtualTextureAdressModeV(sampling_data: u32) -> u32 {
	return (sampling_data >> 16) & 3u;
}

// ====== Indirection Index Table ====== //

override max_anisotropy: f32 = 16;
override border: u32 = 16;
const atlas_offsets = array<vec2u, 7>(
	vec2u(136, 128),	// 0:  1
	vec2u(96, 128),	// 1:  2
	vec2u(56, 128),	// 2:  4
	vec2u(16, 128),	// 3:  8
	vec2u(112, 80),	// 4: 16
	vec2u(112, 16),	// 5: 32
	vec2u(16, 16),	// 6: 64
);
override logical_tile_size: u32 = 128u;
override physical_tile_size: u32 = logical_tile_size + 2 * border;
override svt_ph_tiles_per_dimension: u32 = 51u;

fn virtualTextureMipAtlasCoordinate(v_id: u32) -> vec2u { // todo: replace with actual indirection
	return vec2u(v_id % svt_ph_tiles_per_dimension, v_id / svt_ph_tiles_per_dimension);
}

fn virtualTextureMipAtlasIndex(sampling_data: u32, large_level: u32) -> u32 {
	return clamp(virtualTextureNumLevels(sampling_data) - large_level - 1, 0, 6);
}

fn virtualTextureLoadFromMipAtlas(v_id: u32, coords: vec2u, atlas_index: u32) -> vec4f {
	let tile_coord = virtualTextureMipAtlasCoordinate(v_id);
	let offset = tile_coord * physical_tile_size + atlas_offsets[atlas_index];
	return textureLoad(svt_physical_texture, coords + offset, 0, 0);
}

fn virtualTextureLoadFromMipAtlasFast(coords: vec2u, atlas_index: u32, tile_coord: vec2u) -> vec4f {
	let offset = tile_coord * physical_tile_size + atlas_offsets[atlas_index];
	return textureLoad(svt_physical_texture, coords + offset, 0, 0);
}

fn samplePhysical(sampling_data: u32, c: vec2f, layer: u32, ddx: vec2f, ddy: vec2f, actual_level: f32) -> vec4f {
	if(virtualTextureAnisotropy(sampling_data)) {
		return textureSampleGrad(svt_physical_texture, svt_sampler_ansiotropic, c, layer, ddx, ddy);
	}

	if(actual_level < 1.0) {
		if (virtualTextureLinearMagFiltering(sampling_data)) {
			if(virtualTextureLinearMipmapFiltering(sampling_data)) {
				if(virtualTextureLinearMinFiltering(sampling_data)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler111, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler110, c, layer, ddx, ddy);
				}
			} else {
				if(virtualTextureLinearMinFiltering(sampling_data)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler011, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler010, c, layer, ddx, ddy);
				}
			}
		} else {
			if(virtualTextureLinearMipmapFiltering(sampling_data)) {
				if(virtualTextureLinearMinFiltering(sampling_data)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler101, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler100, c, layer, ddx, ddy);
				}
			} else {
				if(virtualTextureLinearMinFiltering(sampling_data)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler001, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler000, c, layer, ddx, ddy);
				}
			}
		}
	} else {
		if(virtualTextureLinearMipmapFiltering(sampling_data)) {
			if(virtualTextureLinearMinFiltering(sampling_data)) {
				return textureSampleGrad(svt_physical_texture, svt_sampler111, c, layer, ddx, ddy);
			} else {
				return textureSampleGrad(svt_physical_texture, svt_sampler110, c, layer, ddx, ddy);
			}
		} else {
			if(virtualTextureLinearMinFiltering(sampling_data)) {
				return textureSampleGrad(svt_physical_texture, svt_sampler011, c, layer, ddx, ddy);
			} else {
				return textureSampleGrad(svt_physical_texture, svt_sampler010, c, layer, ddx, ddy);
			}
		}
	}
}

fn virtualTextureSampleFromMipAtlas(v_id: u32, sampling_data: u32, coords: vec2f, atlas_index:u32, ddx: vec2f, ddy: vec2f, actual_level: f32) -> vec4f {
	let tile_coord = virtualTextureMipAtlasCoordinate(v_id);
	let offset = tile_coord * physical_tile_size + atlas_offsets[atlas_index];
	let c = (coords + vec2f(offset)) / vec2f(textureDimensions(svt_physical_texture));
	let layer = 0u;
	return samplePhysical(sampling_data, c, layer, ddx, ddy, actual_level);
}

fn mod11(a: f32, b: f32) -> f32 {
	return a - floor(a / b) * b;
}

fn virtualTextureWrappSingle(coord: f32, mode: u32) -> f32 {
	switch mode {
		case 0: {
			return clamp(coord, 0.0, 1.0);
		}
		case 1: {
			return mod11(coord, 1.0);
		}
		case 2: {
			return 1.0 - 2.0 * abs(mod11(coord * 0.5, 1.0) - 0.5);
		}
		default: {
			return coord;
		}
	}
}

fn virtualTextureWrapp(coord: vec2f, sampling_data: u32) -> vec2f {
	return vec2f(
		virtualTextureWrappSingle(coord.x, virtualTextureAdressModeU(sampling_data)),
		virtualTextureWrappSingle(coord.y, virtualTextureAdressModeV(sampling_data)));
}

// incompleate
fn virtualTextureLoad(v_id: u32, coordsi: vec2i, level: u32) -> vec4f {
	if (coordsi.x < 0 || coordsi.y < 0) {
		return vec4f(0);
	}
	let coords = vec2u(coordsi);
	let info = svt_texture_info[v_id];
	let level_size = virtualTextureLevelDimensions(vec2u(info.width, info.height), level);
	if (coords.x >= level_size.x || coords.y >= level_size.y) {
		return vec4f(0);
	}
	if (virtualTextureFirstAtlasedLevel(info.sampling_data) <= level) {
		return virtualTextureLoadFromMipAtlas(v_id, coords, virtualTextureMipAtlasIndex(info.sampling_data, level));
	}
	return vec4f(0);
}

fn virtualTextureLoadFast(coords: vec2u, level: u32, sampling_data: u32, tile_coord: vec2u) -> vec4f {
	if (virtualTextureFirstAtlasedLevel(sampling_data) <= level) {
		return virtualTextureLoadFromMipAtlasFast(coords, virtualTextureMipAtlasIndex(sampling_data, level), tile_coord);
	}
	return vec4f(0); // todo: implement other case
}

fn virtualTextureGather4Fast(
	coords0: vec2u,
	coords1: vec2u,
	coords2: vec2u,
	coords3: vec2u,
	level: u32,
	sampling_data: u32,
	tile_coord: vec2u) -> array<vec4f, 4> {
	if (virtualTextureFirstAtlasedLevel(sampling_data) <= level) {
		let atlas_index = virtualTextureMipAtlasIndex(sampling_data, level);
		let offset = tile_coord * physical_tile_size + atlas_offsets[atlas_index];
		return array<vec4f, 4>(
			textureLoad(svt_physical_texture, coords0 + offset, 0, 0),
			textureLoad(svt_physical_texture, coords1 + offset, 0, 0),
			textureLoad(svt_physical_texture, coords2 + offset, 0, 0),
			textureLoad(svt_physical_texture, coords3 + offset, 0, 0)
			);
	}
	return array<vec4f, 4>(vec4f(0), vec4f(0), vec4f(0), vec4f(0));
}

fn virtualTextureQueryLevel(duvdx: vec2f, duvdy: vec2f, use_anisotropy: bool) -> f32 {
	let rho_x = length(duvdx);
	let rho_y = length(duvdy);
	let rho_max = max(rho_x, rho_y);
	if (!use_anisotropy) {
		return log2(rho_max);
	}
	let rho_min = min(rho_x, rho_y);
	let n = min(ceil(rho_max / rho_min), max_anisotropy);
	return log2(rho_max / n);
}
const col = array<vec4f, 8>(
	vec4f(1, 1, 1, 1),
	vec4f(1, 0.5, 0.5, 1),
	vec4f(0.5, 1, 0.5, 1),
	vec4f(0.5, 0.5, 1.0, 1),
	vec4f(0.5, 1, 1, 1),
	vec4f(1, 0.5, 1, 1),
	vec4f(1, 1, 0.5, 1),
	vec4f(0.5, 0.5, 0.5, 1),
);

fn virtualTextureSampleBias(v_id: u32, coords: vec2f, bias: f32) -> vec4f {
	let info = svt_texture_info[v_id];
	let tex_size = vec2f(f32(info.width), f32(info.height));
	let pixel_coords = coords * tex_size;
	let bias_factor = pow(2.0, bias);
	let duvdx = dpdxFine(pixel_coords) * bias_factor;
	let duvdy = dpdyFine(pixel_coords) * bias_factor;
	let level = clamp(virtualTextureQueryLevel(duvdx, duvdy, virtualTextureAnisotropy(info.sampling_data)), 0.0, f32(virtualTextureNumLevels(info.sampling_data)) - 1);
	let large_level = u32(floor(level));
	let wrapped_coords = virtualTextureWrapp(coords, info.sampling_data);
	let level_size = vec2f(virtualTextureLevelDimensions(vec2u(info.width, info.height), large_level));
	let wrapped_pixel_coords = wrapped_coords * level_size;

	if (virtualTextureFirstAtlasedLevel(info.sampling_data) <= large_level) {
		let ai = virtualTextureMipAtlasIndex(info.sampling_data, large_level);
		let ph_size = textureDimensions(svt_physical_texture);
		let grad_corr = f32((1u << large_level) * ph_size.x);
		return virtualTextureSampleFromMipAtlas(v_id, info.sampling_data, wrapped_pixel_coords, ai, duvdx / grad_corr, duvdy / grad_corr, level);
	}
	
	return vec4f(0);
}

// incompleate
fn virtualTextureSample(v_id: u32, coords: vec2f) -> vec4f {
	return virtualTextureSampleBias(v_id, coords, 0.0);
}