#include "SVTConfig.hpp"
#include <emscripten/bind.h>

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoSVTConfigWASM) {
	class_<kayo::SVTConfig>("SVTConfig")
		.property("tileBorder", &kayo::SVTConfig::tile_border_px)
		.property("logicalTileSize", &kayo::SVTConfig::logical_tile_size_px)
		.property("physicalTileSize", &kayo::SVTConfig::physical_tile_size_px)
		.property("largestAtlasMipSize", &kayo::SVTConfig::largest_atlas_mip_size_px);
}