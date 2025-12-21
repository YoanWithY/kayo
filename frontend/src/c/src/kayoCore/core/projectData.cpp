#include "projectData.hpp"
#include <emscripten/bind.h>

namespace kayo {
ProjectData::ProjectData() {
	this->timeLine.framesPerSecond = 30;
	this->timeLine.simulationTime = 0;
	this->timeLine.simulationTimeVelocity.create();

	this->svt_config.logical_tile_size_px = 128;
	this->svt_config.tile_border_px = 16;
	this->svt_config.physical_tile_size_px = this->svt_config.logical_tile_size_px + 2 * this->svt_config.tile_border_px;
	this->svt_config.largest_atlas_mip_size_px = 64;
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{16, 16});
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{112, 16});
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{112, 80});
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{16, 128});
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{56, 128});
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{96, 128});
	this->svt_config.atlas_offsets.emplace_back(std::array<int32_t, 2>{136, 128});
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoProjectWASM) {
	class_<kayo::ProjectData>("ProjectData")
		.constructor<>()
		.property("svtConfig", &kayo::ProjectData::svt_config, return_value_policy::reference())
		.property("timeLine", &kayo::ProjectData::timeLine, return_value_policy::reference());
}