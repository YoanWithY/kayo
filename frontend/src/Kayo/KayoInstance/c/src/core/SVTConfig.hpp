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
	std::vector<std::array<int32_t, 2>> atlas_offsets;
	SVTConfig() {
		tile_border_px = 16;
		logical_tile_size_px = 128;
		physical_tile_size_px = logical_tile_size_px + 2 * tile_border_px;
		largest_atlas_mip_size_px = 64;
		atlas_offsets.emplace_back(std::array<int32_t, 2>{16, 16});
		atlas_offsets.emplace_back(std::array<int32_t, 2>{112, 16});
		atlas_offsets.emplace_back(std::array<int32_t, 2>{112, 80});
		atlas_offsets.emplace_back(std::array<int32_t, 2>{16, 128});
		atlas_offsets.emplace_back(std::array<int32_t, 2>{56, 128});
		atlas_offsets.emplace_back(std::array<int32_t, 2>{96, 128});
		atlas_offsets.emplace_back(std::array<int32_t, 2>{136, 128});
	}
};
} // namespace kayo