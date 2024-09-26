#pragma once
#include <vector>
#include "../zlib/zlib.h"

Bytef *zlib_decompress(const Bytef *input, size_t input_length, size_t *output_length);