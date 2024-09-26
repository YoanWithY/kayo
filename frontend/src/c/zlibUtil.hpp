#pragma once
#include <vector>
#include "zlib-1.3.1/zlib.h"

std::vector<Bytef> decompress(const Bytef *source, size_t sourceLen);