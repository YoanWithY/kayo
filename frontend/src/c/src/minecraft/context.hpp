#pragma once
#include "../kayoCore/core/kayoCore.hpp"
#include "nbt.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace minecraft {

typedef std::map<std::tuple<int, int>, const uint8_t*> RegionsRawData;
typedef std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*> NBTChunks;
typedef std::map<std::tuple<int, int8_t, int>, const uint16_t*> SectionBlockIndices;

class DimensionData {
  public:
	const std::string name;
	const int32_t index;
	DimensionData(std::string name, int32_t index);
	RegionsRawData regionsRawData;
	NBTChunks nbtChunks;
	SectionBlockIndices sectionBlockIndices;
	const NBT::CompoundTag* getChunk(int32_t chunk_x, int32_t chunkZ);
	void openRegion(int32_t region_x, int32_t region_z, std::string file);
	int buildChunk(int32_t chunk_x, int32_t chunk_z);
	std::string getPalette(int32_t chunk_x, int8_t section_y, int32_t chunk_z);
	emscripten::val getSectionView(int32_t chunk_x, int8_t section_y, int8_t chunk_z);
};

class WorldData {
  private:
	std::map<int32_t, DimensionData> dimensions;

  public:
	std::string name;
	WorldData(std::string world_name);
	DimensionData& createDimensionData(std::string dimension_name, int32_t index);
};

class WASMMinecraftModule : kayo::WASMModule {
	std::map<std::string, WorldData> worlds;

  public:
	WASMMinecraftModule(WASMInstance& instance);
	WorldData& createWorldData(std::string name);
	int32_t pre_registration() override;
	int32_t post_registration() override;
	~WASMMinecraftModule() override;
};

} // namespace minecraft
} // namespace kayo