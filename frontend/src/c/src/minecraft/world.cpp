#include "world.hpp"

#include <cstdint>
#include <map>

namespace minecraft {

RegionsRawData& World::getRegionsByDimension(int8_t id) {
	switch (id) {
	case 0:
		return this->overWorldRegions;
	case -1:
		return this->netherRegions;
	case 1:
		return this->endRegions;
	default:
		return this->overWorldRegions;
	}
}

Chunks& World::getChunksByDimension(int8_t id) {
	switch (id) {
	case 0:
		return this->overWorldChunks;
	case -1:
		return this->netherChunks;
	case 1:
		return this->endChunks;
	default:
		return this->overWorldChunks;
	}
}

SectionBlockIndices& World::getSectionsByDimension(int8_t id) {
	switch (id) {
	case 0:
		return this->overWorldSections;
	case -1:
		return this->netherSections;
	case 1:
		return this->endSections;
	default:
		return this->overWorldSections;
	}
}
} // namespace minecraft