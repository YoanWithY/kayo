#pragma once
#include <array>
#include <cstdint>
#include <vector>
namespace kayo {
class SVTConfig {
  public:
	uint32_t tile_border_px;
	uint32_t logical_tile_size_px;
	uint32_t physical_tile_size_px;
	uint32_t largest_atlas_mip_size_px;
	uint32_t num_mips_in_atlas;
	std::vector<std::array<int32_t, 2>> atlas_offsets;
};
} // namespace kayo