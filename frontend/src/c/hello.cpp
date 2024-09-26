#include <emscripten/bind.h>
#include <cstdint>
#include <iostream>
#include <vector>
#include "zlibUtil.hpp"

#define CHAR_TO_U32(c) (static_cast<uint32_t>(static_cast<unsigned char>(c)))
#define CHAR_TO_U8(c) (static_cast<uint8_t>(c))

void helloWorld()
{
	std::cout << "Hello from WASM!" << std::endl;
}

struct ChunkDescription
{
	uint32_t offset;
	uint8_t sectorCount;
};

ChunkDescription getChunkDescription(std::string &data, uint8_t x, uint8_t y)
{
	uint32_t off = (y * 32 + x) * 4;
	uint32_t offset = CHAR_TO_U32(data[off]) << 2;
	offset |= CHAR_TO_U32(data[off + 1]) << 1;
	offset |= CHAR_TO_U32(data[off + 2]);
	uint8_t sectorCount = CHAR_TO_U8(data[off + 3]);
	return {offset, sectorCount};
}

// void readChunk(std::string &data, ChunkDescription chunkDescription)
// {
// 	uint32_t byteOffset = chunkDescription.offset * 4096;
// 	size_t byteSize = chunkDescription.sectorCount * 4096;
// 	std::vector<Bytef> res = decompress(reinterpret_cast<const Bytef *>(&(data.c_str()[byteOffset])), byteSize);
// 	std::cout << res[0] << std::endl;
// }

void read(std::string data)
{
	// readChunk(data, getChunkDescription(data, 0, 0));
	for (uint8_t y = 0; y < 32; y++)
	{
		for (uint8_t x = 0; x < 32; x++)
		{
			ChunkDescription d = getChunkDescription(data, x, y);
			std::cout << "x: " << uint32_t(x) << " y: " << uint32_t(y) << " offset: " << d.offset << " sectors: " << uint32_t(d.sectorCount) << std::endl;
		}
	}
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(my_module)
{
	function("helloWorld", &helloWorld);
	function("read", &read);
}