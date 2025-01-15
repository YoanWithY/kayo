@group(0) @binding(128) var svt_image_info_table : texture_2d<u32>;
@group(0) @binding(129) var svt_indirection_index_table : texture_2d<u32>;
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

fn virtualTextureIDCoordinate(v_id: u32) -> vec2u {
	let tex_size = textureDimensions(svt_image_info_table);
	return vec2u(v_id % tex_size.x, v_id / tex_size.y);
}

fn virtualTextureInfo(vIDCoord: vec2u) -> vec4u {
	return textureLoad(svt_image_info_table, vIDCoord, 0);
}

fn virtualTextureDimensions(info: vec4u) -> vec2u {
	return info.xy;
}

fn virtualTextureLevelDimensions(info: vec4u, level: u32) -> vec2u {
	return max(info.xy >> vec2u(level), vec2u(1));
}

fn virtualTextureNumLevels(info: vec4u) -> u32 {
	return info.z >> 8;
}

fn virtualTextureFirstAtlasedLevel(info: vec4u) -> u32 {
	return info.z & 0xFF;
}

fn virtualTextureIndirectionTableAtlasLayer(info: vec4u) -> u32 {
	return info.w >> 8;
}

fn virtualTextureFiltering(info: vec4u) -> u32 {
	return (info.w >> 4) & 0xF;
}

fn virtualTextureAnisotropy(info: vec4u) -> bool {
	return ((info.w >> 7) & 1u) == 1u;
}

fn virtualTextureLinearMipmapFiltering(info: vec4u) -> bool {
	return ((info.w >> 6) & 1u) == 1u;
}

fn virtualTextureLinearMagFiltering(info: vec4u) -> bool {
	return ((info.w >> 5) & 1u) == 1u;
}

fn virtualTextureLinearMinFiltering(info: vec4u) -> bool {
	return ((info.w >> 4) & 1u) == 1u;
}

fn virtualTextureAdressModeU(info: vec4u) -> u32 {
	return (info.w >> 2) & 3u;
}

fn virtualTextureAdressModeV(info: vec4u) -> u32 {
	return info.w & 3u;
}

// ====== Indirection Index Table ====== //

fn virtualTextureLevelInfo(v_id_coord: vec2u, level: u32) -> vec4u {
	return textureLoad(svt_indirection_index_table, v_id_coord, level);
}

fn virtualTexureLevelAtlasCoordinate(level_info: vec4u) -> vec2u {
	return level_info.xy;
}

fn virtualTextureLevelAtlasDimensions(level_info: vec4u) -> vec2u {
	return level_info.zw;
}

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

fn virtualTextureMipAtlasCoordinate(v_id: u32) -> vec2u {
	return vec2u(v_id % svt_ph_tiles_per_dimension, v_id / svt_ph_tiles_per_dimension);
}

fn virtualTextureMipAtlasIndex(info: vec4u, large_level: u32) -> u32 {
	return clamp(virtualTextureNumLevels(info) - large_level - 1, 0, 6);
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

fn samplePhysical(info: vec4u, c: vec2f, layer: u32, ddx: vec2f, ddy: vec2f, actual_level: f32) -> vec4f {
	if(virtualTextureAnisotropy(info)) {
		return textureSampleGrad(svt_physical_texture, svt_sampler_ansiotropic, c, layer, ddx, ddy);
	}

	if(actual_level < 1.0) {
		if (virtualTextureLinearMagFiltering(info)) {
			if(virtualTextureLinearMipmapFiltering(info)) {
				if(virtualTextureLinearMinFiltering(info)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler111, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler110, c, layer, ddx, ddy);
				}
			} else {
				if(virtualTextureLinearMinFiltering(info)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler011, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler010, c, layer, ddx, ddy);
				}
			}
		} else {
			if(virtualTextureLinearMipmapFiltering(info)) {
				if(virtualTextureLinearMinFiltering(info)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler101, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler100, c, layer, ddx, ddy);
				}
			} else {
				if(virtualTextureLinearMinFiltering(info)) {
					return textureSampleGrad(svt_physical_texture, svt_sampler001, c, layer, ddx, ddy);
				} else {
					return textureSampleGrad(svt_physical_texture, svt_sampler000, c, layer, ddx, ddy);
				}
			}
		}
	} else {
		if(virtualTextureLinearMipmapFiltering(info)) {
			if(virtualTextureLinearMinFiltering(info)) {
				return textureSampleGrad(svt_physical_texture, svt_sampler111, c, layer, ddx, ddy);
			} else {
				return textureSampleGrad(svt_physical_texture, svt_sampler110, c, layer, ddx, ddy);
			}
		} else {
			if(virtualTextureLinearMinFiltering(info)) {
				return textureSampleGrad(svt_physical_texture, svt_sampler011, c, layer, ddx, ddy);
			} else {
				return textureSampleGrad(svt_physical_texture, svt_sampler010, c, layer, ddx, ddy);
			}
		}
	}
}

fn virtualTextureSampleFromMipAtlas(v_id: u32, info: vec4u, coords: vec2f, atlas_index:u32, ddx: vec2f, ddy: vec2f, actual_level: f32) -> vec4f {
	let tile_coord = virtualTextureMipAtlasCoordinate(v_id);
	let offset = tile_coord * physical_tile_size + atlas_offsets[atlas_index];
	let c = (coords + vec2f(offset)) / vec2f(textureDimensions(svt_physical_texture));
	let layer = 0u;
	return samplePhysical(info, c, layer, ddx, ddy, actual_level);
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

fn virtualTextureWrapp(coord: vec2f, info: vec4u) -> vec2f {
	return vec2f(
		virtualTextureWrappSingle(coord.x, virtualTextureAdressModeU(info)),
		virtualTextureWrappSingle(coord.y, virtualTextureAdressModeV(info)));
}

// incopleate
fn virtualTextureLoad(v_id: u32, coordsi: vec2i, level: u32) -> vec4f {
	if (coordsi.x < 0 || coordsi.y < 0) {
		return vec4f(0);
	}
	let coords = vec2u(coordsi);
	let v_id_coord = virtualTextureIDCoordinate(v_id);
	let info = virtualTextureInfo(v_id_coord);
	let level_size = virtualTextureLevelDimensions(info, level);
	if (coords.x >= level_size.x || coords.y >= level_size.y) {
		return vec4f(0);
	}
	if (virtualTextureFirstAtlasedLevel(info) <= level) {
		return virtualTextureLoadFromMipAtlas(v_id, coords, virtualTextureMipAtlasIndex(info, level));
	}
	return vec4f(0);
}

fn virtualTextureLoadFast(coords: vec2u, level: u32, info: vec4u, tile_coord: vec2u) -> vec4f {
	if (virtualTextureFirstAtlasedLevel(info) <= level) {
		return virtualTextureLoadFromMipAtlasFast(coords, virtualTextureMipAtlasIndex(info, level), tile_coord);
	}
	return vec4f(0);
}

fn virtualTextureGather4Fast(coords0: vec2u, coords1: vec2u, coords2: vec2u, coords3: vec2u, level: u32, info: vec4u, tile_coord: vec2u) -> array<vec4f, 4> {
	if (virtualTextureFirstAtlasedLevel(info) <= level) {
		let atlas_index = virtualTextureMipAtlasIndex(info, level);
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
// incopleate
fn virtualTextureSample(v_id: u32, coords: vec2f) -> vec4f {
	let v_id_coord = virtualTextureIDCoordinate(v_id);
	let info = virtualTextureInfo(v_id_coord);
	let tex_size = vec2f(virtualTextureDimensions(info));
	let pixel_coords = coords * tex_size;
	let duvdx = dpdxFine(pixel_coords);
	let duvdy = dpdyFine(pixel_coords);
	let level = clamp(virtualTextureQueryLevel(duvdx, duvdy, virtualTextureAnisotropy(info)), 0.0, f32(virtualTextureNumLevels(info)) - 1);
	let large_level = u32(floor(level));
	let wrapped_coords = virtualTextureWrapp(coords, info);
	let level_size = vec2f(virtualTextureLevelDimensions(info, large_level));
	let wrapped_pixel_coords = wrapped_coords * level_size;

	if (virtualTextureFirstAtlasedLevel(info) <= large_level) {
		let ai = virtualTextureMipAtlasIndex(info, large_level);
		let ph_size = textureDimensions(svt_physical_texture);
		let grad_corr = f32((1u << large_level) * ph_size.x);
		return virtualTextureSampleFromMipAtlas(v_id, info, wrapped_pixel_coords, ai, duvdx / grad_corr, duvdy / grad_corr, level);
	}
	
	return vec4f(0);
}