#include "context.hpp"
#include "../numerics/fixedMath.hpp"
#include "../utils/zlibUtil.hpp"
#include "parse.hpp"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <map>
#include <tuple>
#include <vector>

namespace kayo {
namespace minecraft {

struct ChunkDescription {
	uint32_t offset;
	uint8_t sectorCount;
};

static ChunkDescription getChunkDescription(const Bytef* data, uint8_t x, uint8_t y) {
	uint32_t off = (y * 32 + x) * 4;
	uint32_t offset = readU32AsBigEndian(data + off, 3);
	uint8_t sectorCount = CHAR_TO_U8(data[off + 3]);
	return {offset, sectorCount};
}

static void buildChunkSections(std::map<std::tuple<int, int8_t, int>, const uint16_t*>& sectionsMap, const NBT::CompoundTag* chunk) {
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
		size_t paletteSize = palette->value.size();
		if (paletteSize <= 1)
			continue;

		uint8_t bitsPerIndex = std::max(static_cast<uint8_t>(std::ceil(std::log2(paletteSize))), uint8_t(4));
		uint64_t mask = (1ULL << bitsPerIndex) - 1;

		uint8_t indicesPerLong = 64 / bitsPerIndex;
		NBT::LongArrayTag* data = block_states->getTag<NBT::LongArrayTag>("data");

		uint16_t* sectionIndices = new uint16_t[4096];
		size_t longIndex = 0;
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

static NBT::CompoundTag* readChunk(const Bytef* data, ChunkDescription chunkDescription) {
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

int DimensionData::buildChunk(int chunk_x, int chunk_z) {
	int region_x = chunk_x >> 5;
	int region_z = chunk_z >> 5;
	const uint8_t* region;

	if (auto it = this->regionsRawData.find(std::make_tuple(region_x, region_z)); it != this->regionsRawData.end())
		region = it->second;
	else {
		std::cerr << "Could not find region for chunk." << std::endl;
		return -1;
	}

	uint8_t inner_chunk_x = uint8_t(modulus(chunk_x, 32));
	uint8_t inner_chunk_z = uint8_t(modulus(chunk_z, 32));
	NBT::CompoundTag* chunk = readChunk(region, getChunkDescription(region, inner_chunk_x, inner_chunk_z));
	if (!chunk) {
		std::cerr << "Read chunk is NULL." << std::endl;
		return -3;
	}

	this->nbtChunks[std::make_tuple(chunk_x, chunk_z)] = chunk;
	buildChunkSections(this->sectionBlockIndices, chunk);
	return 0;
}

const NBT::CompoundTag* DimensionData::getChunk(int32_t chunk_x, int32_t chunk_z) {
	try {
		return this->nbtChunks.at(std::make_tuple(chunk_x, chunk_z));
	} catch (const std::out_of_range& e) {
		return NULL;
	}
}

std::string DimensionData::getPalette(int32_t chunk_x, int8_t y, int32_t chunk_z) {
	auto chunk = this->nbtChunks[std::make_tuple(chunk_x, chunk_z)];
	auto sections = chunk->getTag<NBT::ListTag>("sections");
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

emscripten::val DimensionData::getSectionView(int32_t chunk_x, int8_t section_y, int8_t chunk_z) {
	const uint16_t* section;
	try {
		section = this->sectionBlockIndices.at(std::make_tuple(chunk_x, section_y, chunk_z));
	} catch (const std::out_of_range& e) {
		std::ostringstream oss;
		oss << "The given section at dimension \"" << this->name << "\", X: " << chunk_x << ", Y: " << int(section_y) << ", Z: " << chunk_z << " is not known." << std::endl;
		throw std::runtime_error(oss.str());
	}

	return emscripten::val(emscripten::typed_memory_view(4096 * 2, section));
}

void DimensionData::openRegion(int32_t region_x, int32_t region_z, std::string file) {
	uint8_t* data = new Bytef[file.size()];
	std::memcpy(data, file.data(), file.size());
	this->regionsRawData[std::tuple<int, int>(region_x, region_z)] = data;
}

DimensionData::DimensionData(std::string name, int32_t index) : name(name), index(index) {}
WorldData::WorldData(std::string name) : name(name) {}

} // namespace minecraft
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWasmMinecraft) {
	class_<kayo::minecraft::WorldData>("KayoWASMMinecraftWorld")
		.constructor<std::string>();
	class_<kayo::minecraft::DimensionData>("KayoWASMMinecraftDimension")
		.constructor<std::string, int32_t>()
		.function("openRegion", &kayo::minecraft::DimensionData::openRegion)
		.function("buildChunk", &kayo::minecraft::DimensionData::buildChunk)
		.function("getPalette", &kayo::minecraft::DimensionData::getPalette)
		.function("getSectionView", &kayo::minecraft::DimensionData::getSectionView);
}
