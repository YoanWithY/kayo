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

int ImageData::getWidth() const {
	return this->width;
}

int ImageData::getHeight() const {
	return this->height;
}

int ImageData::getComponents() const {
	return this->components;
}

int ImageData::getBytesPerComponent() const {
	return this->bytes_per_component;
}

ImageData* ImageData::fromImageData(std::string raw_data) {
	ImageData* image_data = new ImageData();
	if (!image_data)
		return image_data;

	const uint8_t* raw_image_data = reinterpret_cast<const uint8_t*>(raw_data.data());
	const int raw_image_size = static_cast<int>(raw_data.size());
	uint8_t* raw_data_bytes;

	if (stbi_is_hdr_from_memory(raw_image_data, raw_image_size)) {
		image_data->bytes_per_component = static_cast<int>(sizeof(float));
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_loadf_from_memory(raw_image_data, raw_image_size, &image_data->width, &image_data->height, &image_data->components, 0));
	} else if (stbi_is_16_bit_from_memory(raw_image_data, raw_image_size)) {
		image_data->bytes_per_component = static_cast<int>(sizeof(uint16_t));
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_load_16_from_memory(raw_image_data, raw_image_size, &image_data->width, &image_data->height, &image_data->components, 0));
	} else {
		image_data->bytes_per_component = static_cast<int>(sizeof(uint8_t));
		raw_data_bytes = reinterpret_cast<uint8_t*>(stbi_load_from_memory(raw_image_data, raw_image_size, &image_data->width, &image_data->height, &image_data->components, 0));
	}

	const int image_size = image_data->width * image_data->height * image_data->components * image_data->bytes_per_component;
	image_data->data = std::vector<uint8_t>(raw_data_bytes, raw_data_bytes + image_size);
	stbi_image_free(raw_data_bytes);
	return image_data;
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoImageUtilsWASM) {
	class_<ImageData>("ImageData")
		.class_function("fromImageData", &ImageData::fromImageData, return_value_policy::take_ownership())
		.property("width", &ImageData::getWidth)
		.property("height", &ImageData::getHeight)
		.property("components", &ImageData::getComponents)
		.property("bytesPerComponents", &ImageData::getBytesPerComponent)
		.property("data", &ImageData::data, return_value_policy::reference());
}