#define STB_IMAGE_IMPLEMENTATION
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wold-style-cast"
#pragma GCC diagnostic ignored "-Wsign-conversion"
#pragma GCC diagnostic ignored "-Wconversion"
#include "../../stb/stb_image.h"
#pragma GCC diagnostic pop

#include "imageUtils.hpp"
#include <emscripten/bind.h>
#include <iostream>

namespace kayo {

template <ImageDataType T>
void ImageDataImplementation<T>::generateMipLevels() {
	if (this->data[0] == nullptr) {
		std::cerr << "Error: Mip level 0 is not present." << std::endl;
		return;
	}

	for (uint32_t level = 1; level < this->num_mip_levels; ++level) {
		uint32_t mip_width = this->getMipWidth(level);
		uint32_t mip_height = this->getMipHeight(level);

		T* mip_data = new T[this->getMipLevelByteSize(level) / this->bytes_per_component];
		this->data[level] = mip_data;

		for (uint32_t y = 0; y < mip_height; ++y) {
			uint32_t py = y * 2;
			for (uint32_t x = 0; x < mip_width; ++x) {
				uint32_t px = x * 2;
				FixedPoint::vec4f sum(0.0f);
				for (uint32_t dy = 0; dy < 2; ++dy) {
					for (uint32_t dx = 0; dx < 2; ++dx) {
						uint32_t src_x = std::min(px + dx, this->getMipWidth(level - 1) - 1);
						uint32_t src_y = std::min(py + dy, this->getMipHeight(level - 1) - 1);
						sum = sum + this->texelFetch(src_x, src_y, level - 1);
					}
				}
				FixedPoint::vec4f avg = sum * 0.25f;
				this->setPixel(x, y, level, avg);
			}
		}
	}
	this->num_stored_mip_levels = this->num_mip_levels;
}

ImageData* ImageData::fromImageData(std::string raw_data, bool gen_mip_maps) {
	const uint8_t* raw_image_data = reinterpret_cast<const uint8_t*>(raw_data.data());
	const int raw_image_size = static_cast<int>(raw_data.size());
	void* raw_data_bytes;
	int w, h, nc;
	ImageData* image_data;

	if (stbi_is_hdr_from_memory(raw_image_data, raw_image_size)) {
		raw_data_bytes = (stbi_loadf_from_memory(raw_image_data, raw_image_size, &w, &h, &nc, 0));
		image_data = new ImageDataImplementation<float>(static_cast<uint32_t>(w), static_cast<uint32_t>(h), static_cast<uint32_t>(nc));
		image_data->bytes_per_component = static_cast<int>(sizeof(float));
	} else if (stbi_is_16_bit_from_memory(raw_image_data, raw_image_size)) {
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_load_16_from_memory(raw_image_data, raw_image_size, &w, &h, &nc, 0));
		image_data = new ImageDataImplementation<uint16_t>(static_cast<uint32_t>(w), static_cast<uint32_t>(h), static_cast<uint32_t>(nc));
		image_data->bytes_per_component = static_cast<int>(sizeof(uint16_t));
	} else {
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_load_from_memory(raw_image_data, raw_image_size, &w, &h, &nc, 0));
		image_data = new ImageDataImplementation<uint8_t>(static_cast<uint32_t>(w), static_cast<uint32_t>(h), static_cast<uint32_t>(nc));
		image_data->bytes_per_component = static_cast<int>(sizeof(uint8_t));
	}
	uint32_t size = image_data->getMipLevelByteSize(0);
	void* buffer = new uint8_t[size];
	std::memcpy(buffer, raw_data_bytes, size);
	image_data->data[0] = buffer;
	image_data->num_stored_mip_levels = 1;

	stbi_image_free(raw_data_bytes);

	if (gen_mip_maps)
		image_data->generateMipLevels();
	return image_data;
}

emscripten::val ImageData::getMipData(uint32_t level) const {
	if (level >= this->num_mip_levels || !this->data[level]) {
		return emscripten::val::undefined();
	}
	uint32_t size = this->getMipLevelByteSize(level);
	return emscripten::val(emscripten::typed_memory_view(size, static_cast<uint8_t*>(this->data[level])));
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoImageUtilsWASM) {
	class_<kayo::ImageData>("ImageData")
		.class_function("fromImageData", &kayo::ImageData::fromImageData, return_value_policy::reference())
		.property("width", &kayo::ImageData::getWidth)
		.property("height", &kayo::ImageData::getHeight)
		.property("numComponents", &kayo::ImageData::getNumComponents)
		.property("bytesPerComponent", &kayo::ImageData::getBytesPerComponent)
		.property("bytesPerRow", &kayo::ImageData::getBytesPerRow)
		.property("numMipLevels", &kayo::ImageData::getNumMipLevels)
		.property("numStoredMipLevels", &kayo::ImageData::getNumStoredMipLevels)
		.function("getMipData", &kayo::ImageData::getMipData)
		.function("getMipLevelByteSize", &kayo::ImageData::getMipLevelByteSize)
		.function("getMipWidth", &kayo::ImageData::getMipWidth)
		.function("getMipHeight", &kayo::ImageData::getMipHeight)
		.function("getMipBytesPerRow", &kayo::ImageData::getMipBytesPerRow);
	class_<kayo::ImageDataImplementation<uint8_t>, base<kayo::ImageData>>("ImageDataUint8")
		.class_function("empty", &kayo::ImageDataImplementation<uint8_t>::empty, return_value_policy::reference());
}