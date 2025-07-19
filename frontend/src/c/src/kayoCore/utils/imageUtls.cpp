#define STB_IMAGE_IMPLEMENTATION
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wold-style-cast"
#pragma GCC diagnostic ignored "-Wsign-conversion"
#pragma GCC diagnostic ignored "-Wconversion"
#include "../../../stb/stb_image.h"
#pragma GCC diagnostic pop

#include "imageUtils.hpp"
#include <emscripten/bind.h>
#include <iostream>

template <ImageDataType T>
void ImageDataImplempentation<T>::generateMipLevels() {
	if (this->data[0] == nullptr) {
		std::cerr << "Error: Mip level 0 is not present." << std::endl;
		return;
	}

	for (uint32_t level = 1; level < this->num_mip_levels; ++level) {
		uint32_t mip_width = std::max(1u, this->width >> level);
		uint32_t mip_height = std::max(1u, this->height >> level);
		uint32_t prev_width = std::max(1u, this->width >> (level - 1));
		uint32_t prev_height = std::max(1u, this->height >> (level - 1));

		T* mip_data = new T[this->getMipLevelByteSize(level) / this->bytes_per_component];

		for (uint32_t y = 0; y < mip_height; ++y) {
			uint32_t py = y * 2;
			for (uint32_t x = 0; x < mip_width; ++x) {
				uint32_t px = x * 2;
				for (uint32_t c = 0; c < this->num_components; ++c) {
					uint32_t idx = (y * mip_width + x) * this->num_components + c;

					float sum = 0.0f;
					for (uint32_t dy = 0; dy < 2; ++dy) {
						for (uint32_t dx = 0; dx < 2; ++dx) {
							uint32_t src_x = std::min(px + dx, prev_width - 1);
							uint32_t src_y = std::min(py + dy, prev_height - 1);
							sum += static_cast<float>(this->getComponent(src_x, src_y, level - 1, prev_width, c));
						}
					}
					mip_data[idx] = static_cast<T>(sum / 4.0f);
				}
			}
		}
		this->data[level] = mip_data;
	}
	this->num_stored_mip_levels = this->num_mip_levels;
}

ImageData* ImageData::fromImageData(std::string raw_data) {
	const uint8_t* raw_image_data = reinterpret_cast<const uint8_t*>(raw_data.data());
	const int raw_image_size = static_cast<int>(raw_data.size());
	void* raw_data_bytes;
	int w, h, nc;
	ImageData* image_data;

	if (stbi_is_hdr_from_memory(raw_image_data, raw_image_size)) {
		raw_data_bytes = (stbi_loadf_from_memory(raw_image_data, raw_image_size, &w, &h, &nc, 0));
		image_data = new ImageDataImplempentation<float>(static_cast<uint32_t>(w), static_cast<uint32_t>(h), static_cast<uint32_t>(nc));
		image_data->bytes_per_component = static_cast<int>(sizeof(float));
	} else if (stbi_is_16_bit_from_memory(raw_image_data, raw_image_size)) {
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_load_16_from_memory(raw_image_data, raw_image_size, &w, &h, &nc, 0));
		image_data = new ImageDataImplempentation<uint16_t>(static_cast<uint32_t>(w), static_cast<uint32_t>(h), static_cast<uint32_t>(nc));
		image_data->bytes_per_component = static_cast<int>(sizeof(uint16_t));
	} else {
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_load_from_memory(raw_image_data, raw_image_size, &w, &h, &nc, 0));
		image_data = new ImageDataImplempentation<uint8_t>(static_cast<uint32_t>(w), static_cast<uint32_t>(h), static_cast<uint32_t>(nc));
		image_data->bytes_per_component = static_cast<int>(sizeof(uint8_t));
	}
	uint32_t size = image_data->getMipLevelByteSize(0);
	void* buffer = new uint8_t[size];
	std::memcpy(buffer, raw_data_bytes, size);
	image_data->data[0] = buffer;
	image_data->num_stored_mip_levels = 1;

	stbi_image_free(raw_data_bytes);
	return image_data;
}

emscripten::val ImageData::getMipData(uint32_t level) const {
	if (level >= this->num_mip_levels || !this->data[level]) {
		return emscripten::val::undefined();
	}
	uint32_t size = this->getMipLevelByteSize(level);
	return emscripten::val(emscripten::typed_memory_view(size, static_cast<uint8_t*>(this->data[level])));
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoImageUtilsWASM) {
	class_<ImageData>("ImageData")
		.class_function("fromImageData", &ImageData::fromImageData, return_value_policy::take_ownership())
		.property("width", &ImageData::getWidth)
		.property("height", &ImageData::getHeight)
		.property("numComponents", &ImageData::getNumComponents)
		.property("bytesPerComponent", &ImageData::getBytesPerComponent)
		.property("bytesPerRow", &ImageData::getBytesPerRow)
		.property("numMipLevels", &ImageData::getNumMipLevels)
		.property("numStoredMipLevels", &ImageData::getNumStoredMipLevels)
		.function("getMipData", &ImageData::getMipData)
		.function("getMipLevelByteSize", &ImageData::getMipLevelByteSize)
		.function("getMipWidth", &ImageData::getMipWidth)
		.function("getMipHeight", &ImageData::getMipHeight)
		.function("getMipBytesPerRow", &ImageData::getMipBytesPerRow);
}