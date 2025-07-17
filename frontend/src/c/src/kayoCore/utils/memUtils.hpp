#pragma once
#include <cstdint>
#include <emscripten/bind.h>

struct IndexBlock {
	int32_t start;
	int32_t end;
};

void workerWriteFile(const std::string& path, const std::string& file_name, const void* data, uint32_t byte_length);
