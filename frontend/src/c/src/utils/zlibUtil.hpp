#pragma once
#include "../../zlib/zlib.h"
#include <iostream>
#include <stdexcept>
#include <vector>

inline Bytef* zlib_decompress(const Bytef* input, size_t input_length, size_t* output_length) {
	// Initial output buffer size
	size_t buffer_size = input_length * 4; // Starting size, can adjust if needed
	Bytef* output = static_cast<Bytef*>(malloc(buffer_size));
	if (!output) {
		return NULL; // Memory allocation failed
	}

	int result;
	while ((result = uncompress(output, &buffer_size, input, input_length)) == Z_BUF_ERROR) {
		// Buffer too small, increase its size and try again
		buffer_size *= 2;
		output = static_cast<Bytef*>(realloc(output, buffer_size));
		if (!output) {
			return NULL; // Memory reallocation failed
		}
	}

	if (result != Z_OK) {
		free(output); // Free memory on failure
		return NULL;
	}

	*output_length = buffer_size; // Set the actual decompressed size
	return output;
}