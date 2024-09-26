#include <emscripten/bind.h>
#include <cstdint>
#include <iostream>
#include <vector>
#include "zlibUtil/zlibUtil.hpp"
#include "parse/parse.hpp"
#include "nbt/nbt.hpp"

void helloWorld()
{
	std::cout << "Hello from WASM!" << std::endl;
}

struct ChunkDescription
{
	uint32_t offset;
	uint8_t sectorCount;
};

ChunkDescription getChunkDescription(const Bytef *data, uint8_t x, uint8_t y)
{
	uint32_t off = (y * 32 + x) * 4;
	uint32_t offset = readU32AsBigEndian(data + off, 3);
	uint8_t sectorCount = CHAR_TO_U8(data[off + 3]);
	return {offset, sectorCount};
}

void readChunk(const Bytef *data, ChunkDescription chunkDescription)
{
	uint32_t byteOffset = chunkDescription.offset * 4096;
	size_t byteSize = chunkDescription.sectorCount * 4096;
	const Bytef *chunk = data + byteOffset;
	uint32_t chunkDataLength = readU32AsBigEndian(chunk, 4);
	uint8_t compressionType = CHAR_TO_U8(chunk[4]);
	std::cout << "length: " << chunkDataLength << " compression type: " << int32_t(compressionType) << std::endl;
	size_t size = 0;
	const Bytef *res = zlib_decompress(chunk + 5, chunkDataLength - 1, &size);

	size_t progress = 0;
	NBTBase *tag = parseNBT(res, progress);
	if (tag->id == 10)
	{
		CompoundTag *c = tag->as<CompoundTag>();
		c->display();
	}
}

int readFileAsString(std::string file)
{
	const Bytef *data = reinterpret_cast<const Bytef *>(file.data());
	for (uint8_t y = 0; y < 32; y++)
	{
		for (uint8_t x = 0; x < 32; x++)
		{
			ChunkDescription d = getChunkDescription(data, x, y);
			std::cout << "x: " << uint32_t(x) << " y: " << uint32_t(y) << " offset: " << d.offset << " sectors: " << uint32_t(d.sectorCount) << std::endl;
		}
	}
	readChunk(data, getChunkDescription(data, 0, 0));
	return 0;
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(my_module)
{
	function("helloWorld", &helloWorld);
	function("readFileAsString", &readFileAsString);
}