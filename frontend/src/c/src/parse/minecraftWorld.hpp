#pragma once
#include "nbt.hpp"
#include <cstdint>
#include <map>
class MinecraftWorld {
  private:
	std::map<std::tuple<int, int>, const uint8_t*> overWorldRegions;
	std::map<std::tuple<int, int>, const uint8_t*> netherRegions;
	std::map<std::tuple<int, int>, const uint8_t*> endRegions;
	std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*> overWorldChunks;
	std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*> netherChunks;
	std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*> endChunks;
	std::map<std::tuple<int, int8_t, int>, const uint16_t*> overWorldSections;
	std::map<std::tuple<int, int8_t, int>, const uint16_t*> netherSections;
	std::map<std::tuple<int, int8_t, int>, const uint16_t*> endSections;

  public:
	std::map<std::tuple<int, int>, const uint8_t*>& getRegionsByDimension(int8_t id);
	std::map<std::tuple<uint8_t, uint8_t>, const NBT::CompoundTag*>& getChunksByDimension(int8_t id);
	std::map<std::tuple<int, int8_t, int>, const uint16_t*>& getSectionsByDimension(int8_t id);
};