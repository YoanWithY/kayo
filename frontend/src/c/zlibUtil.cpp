#include <vector>
#include "zlib-1.3.1/zlib.h"
#include <stdexcept>

std::vector<Bytef> decompress(const Bytef *source, size_t sourceLen)
{
	z_stream strm;
	strm.zalloc = Z_NULL;
	strm.zfree = Z_NULL;
	strm.opaque = Z_NULL;
	strm.avail_in = sourceLen;
	strm.next_in = const_cast<Bytef *>(source);

	if (inflateInit(&strm) != Z_OK)
	{
		throw std::runtime_error("Failed to initialize zlib");
	}

	std::vector<Bytef> decompressedData(1024);
	size_t totalOut = 0;

	int ret;
	do
	{
		strm.avail_out = decompressedData.size() - totalOut;
		strm.next_out = decompressedData.data() + totalOut;

		ret = inflate(&strm, Z_NO_FLUSH);
		if (ret < 0)
		{
			inflateEnd(&strm);
			throw std::runtime_error("Decompression failed");
		}

		totalOut += decompressedData.size() - strm.avail_out;

		if (strm.avail_out == 0)
		{
			decompressedData.resize(decompressedData.size() * 2); // Double the buffer size
		}
	} while (ret != Z_STREAM_END);

	inflateEnd(&strm);
	decompressedData.resize(totalOut);
	return decompressedData;
}