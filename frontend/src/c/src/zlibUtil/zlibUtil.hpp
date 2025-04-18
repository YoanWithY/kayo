#pragma once
#include "../../zlib/zlib.h"
#include <vector>

Bytef* zlib_decompress(const Bytef* input, size_t input_length, size_t* output_length);