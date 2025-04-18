#include "minecraftWorld.hpp"

#include <cstdint>
#include <map>

std::map<std::tuple<int, int>, const uint8_t*>& MinecraftWorld::getRegionsByDimension(int8_t id) {
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

std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*>& MinecraftWorld::getChunksByDimension(int8_t id) {
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

std::map<std::tuple<int, int8_t, int>, const uint16_t*>& MinecraftWorld::getSectionsByDimension(int8_t id) {
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