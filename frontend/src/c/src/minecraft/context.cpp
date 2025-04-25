#include "context.hpp"
#include "../numerics/fixedMath.hpp"
#include "../utils/zlibUtil.hpp"
#include "nbt.hpp"
#include "parse.hpp"
#include "world.hpp"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <map>
#include <tuple>
#include <vector>

namespace minecraft {

std::map<std::string, World*> minecraftWorlds;
const NBT::CompoundTag* activeChunk = nullptr;

struct ChunkDescription {
	uint32_t offset;
	uint8_t sectorCount;
};

ChunkDescription getChunkDescription(const Bytef* data, uint8_t x, uint8_t y) {
	uint32_t off = (y * 32 + x) * 4;
	uint32_t offset = readU32AsBigEndian(data + off, 3);
	uint8_t sectorCount = CHAR_TO_U8(data[off + 3]);
	return {offset, sectorCount};
}

void buildChunkSections(std::map<std::tuple<int, int8_t, int>, const uint16_t*>& sectionsMap, const NBT::CompoundTag* chunk) {
	NBT::ListTag* sections = chunk->getTag<NBT::ListTag>("sections");
	int xPos = chunk->getTag<NBT::IntTag>("xPos")->value;
	int zPos = chunk->getTag<NBT::IntTag>("zPos")->value;

	for (NBT::NBTBase* sectionBase : sections->value) {
		NBT::CompoundTag* section = sectionBase->as<NBT::CompoundTag>();
		int8_t yPos = section->getTag<NBT::ByteTag>("Y")->value;
		NBT::CompoundTag* block_states = section->getTag<NBT::CompoundTag>("block_states");
		if (!block_states)
			continue;
		NBT::ListTag* palette = block_states->getTag<NBT::ListTag>("palette");
		int paletteSize = palette->value.size();
		if (paletteSize <= 1)
			continue;

		uint8_t bitsPerIndex = std::max(static_cast<uint8_t>(std::ceil(std::log2(paletteSize))), uint8_t(4));
		uint64_t mask = (1ULL << bitsPerIndex) - 1;

		uint8_t indicesPerLong = 64 / bitsPerIndex;
		NBT::LongArrayTag* data = block_states->getTag<NBT::LongArrayTag>("data");

		uint16_t* sectionIndices = new uint16_t[4096];
		int longIndex = 0;
		uint8_t indexInLong = 0;
		int64_t currentLong = data->value[longIndex];
		for (int i = 0; i < 4096; i++) {
			if (indexInLong == indicesPerLong) {
				indexInLong = 0;
				longIndex++;
				currentLong = data->value[longIndex];
			}
			sectionIndices[i] = extractIndex(currentLong, indexInLong * bitsPerIndex, mask);
			indexInLong++;
		}

		sectionsMap[std::make_tuple(xPos, yPos, zPos)] = sectionIndices;
	}
}

NBT::CompoundTag* readChunk(const Bytef* data, ChunkDescription chunkDescription) {
	uint32_t byteOffset = chunkDescription.offset * 4096;
	const Bytef* chunk = data + byteOffset;
	uint32_t chunkDataLength = readU32AsBigEndian(chunk, 4);
	size_t size = 0;
	const Bytef* res = zlib_decompress(chunk + 5, chunkDataLength - 1, &size);

	size_t progress = 0;
	NBT::NBTBase* tag = NBT::parseNBT(res, progress);
	auto t = tag->as<NBT::CompoundTag>();

	return t;
}

int buildChunk(std::string world, int dimension, int chunkX, int chunkZ) {
	auto minecraftWorld = minecraftWorlds[world];
	if (!minecraftWorld)
		return -1;

	int regionX = chunkX >> 5;
	int regionZ = chunkZ >> 5;
	auto region = minecraftWorld->getRegionsByDimension(dimension)[std::make_tuple(regionX, regionZ)];
	if (!region)
		return -2;

	int innerChunkX = modulus(chunkX, 32);
	int innerChunkZ = modulus(chunkZ, 32);
	auto chunk = readChunk(region, getChunkDescription(region, innerChunkX, innerChunkZ));
	if (!chunk)
		return -3;

	auto& chunks = minecraftWorld->getChunksByDimension(dimension);
	chunks[std::make_tuple(chunkX, chunkZ)] = chunk;

	auto& sections = minecraftWorld->getSectionsByDimension(dimension);
	buildChunkSections(sections, chunk);
	return 0;
}

int setActiveChunk(std::string world, int dimension, int chunkX, int chunkZ) {
	auto minecraftWorld = minecraftWorlds[world];
	if (!minecraftWorld)
		return -1;

	auto chunk = minecraftWorld->getChunksByDimension(dimension)[std::make_tuple(chunkX, chunkZ)];
	if (!chunk)
		return -2;

	activeChunk = chunk;
	return 0;
}

std::string getPalette(int8_t y) {
	auto sections = activeChunk->getTag<NBT::ListTag>("sections");
	for (auto sectionBase : sections->value) {
		auto section = sectionBase->as<NBT::CompoundTag>();
		auto Y = section->getTag<NBT::ByteTag>("Y")->value;
		if (y == Y) {
			std::ostringstream oss;
			section->getTag<NBT::CompoundTag>("block_states")->getTag<NBT::ListTag>("palette")->displayContent(oss);
			return oss.str();
		}
	}
	return "";
}

emscripten::val getSectionView(std::string world, int dimension, int sectionX, int8_t sectionY, int sectionZ) {
	auto minecraftWorld = minecraftWorlds[world];
	if (!minecraftWorld) {
		std::ostringstream oss;
		oss << "The given world: \"" << world << "\" is not known." << std::endl;
		throw std::runtime_error(oss.str());
	}

	auto section = minecraftWorld->getSectionsByDimension(dimension)[std::make_tuple(sectionX, sectionY, sectionZ)];
	if (!section) {
		std::ostringstream oss;
		oss << "The given section at dimension: " << dimension << ", X: " << sectionX << ", Y: " << int(sectionY) << ", Z: " << sectionZ << " is not known." << std::endl;
		throw std::runtime_error(oss.str());
	}
	return emscripten::val(emscripten::typed_memory_view(4096 * 2, section));
}

int8_t getByte(std::string name) {
	return NBT::getGeneric<int8_t, NBT::ByteTag>(activeChunk, name);
}

int16_t getShort(std::string name) {
	return NBT::getGeneric<int16_t, NBT::ShortTag>(activeChunk, name);
}

int32_t getInt(std::string name) {
	return NBT::getGeneric<int32_t, NBT::IntTag>(activeChunk, name);
}

int64_t getLong(std::string name) {
	return NBT::getGeneric<int64_t, NBT::LongTag>(activeChunk, name);
}

float getFloat(std::string name) {
	return NBT::getGeneric<float, NBT::FloatTag>(activeChunk, name);
}

double getDouble(std::string name) {
	return NBT::getGeneric<double, NBT::DoubleTag>(activeChunk, name);
}

emscripten::val getByteArray(std::string name) {
	NBT::ByteArrayTag* bat = NBT::getTag<NBT::ByteArrayTag>(activeChunk, name);
	int8_t* data = bat->value.data();
	size_t bufferLength = bat->value.size();
	return emscripten::val(emscripten::typed_memory_view(bufferLength, data));
}

std::string getString(std::string name) {
	return NBT::getGeneric<std::string, NBT::StringTag>(activeChunk, name);
}

std::string getList(std::string name) {
	std::ostringstream oss;
	NBT::getTag<NBT::ListTag>(activeChunk, name)->displayContent(oss);
	return oss.str();
}

std::string getCompound(std::string name) {
	std::ostringstream oss;
	NBT::getTag<NBT::CompoundTag>(activeChunk, name)->displayContent(oss);
	return oss.str();
}

void openRegion(std::string world, int dimension, int x, int y, std::string file) {
	uint8_t* data = new Bytef[file.size()];
	std::memcpy(data, file.data(), file.size());
	auto minecraftWorld = minecraftWorlds[world];
	if (!minecraftWorld) {
		minecraftWorld = new World();
		minecraftWorlds[world] = minecraftWorld;
	}
	auto& regionMap = minecraftWorld->getRegionsByDimension(dimension);
	regionMap[std::tuple<int, int>(x, y)] = data;
}

} // namespace minecraft