#pragma once
#include "nbt.hpp"
#include <cstdint>
#include <map>

namespace minecraft {

typedef std::map<std::tuple<int, int>, const uint8_t*> RegionsRawData;
typedef std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*> Chunks;
typedef std::map<std::tuple<int, int8_t, int>, const uint16_t*> SectionBlockIndices;

class World {
  private:
	RegionsRawData overWorldRegions;
	RegionsRawData netherRegions;
	RegionsRawData endRegions;
	Chunks overWorldChunks;
	Chunks netherChunks;
	Chunks endChunks;
	SectionBlockIndices overWorldSections;
	SectionBlockIndices netherSections;
	SectionBlockIndices endSections;

  public:
	RegionsRawData& getRegionsByDimension(int8_t id);
	Chunks& getChunksByDimension(int8_t id);
	SectionBlockIndices& getSectionsByDimension(int8_t id);
};

} // namespace minecraft