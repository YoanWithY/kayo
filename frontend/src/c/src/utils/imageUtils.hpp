#pragma once
#include "../numerics/vec4.hpp"
#include <algorithm>
#include <cstdint>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>

namespace kayo {

template <typename T>
concept ImageDataType = std::same_as<T, uint8_t> || std::same_as<T, uint16_t> || std::same_as<T, float>;

namespace ImageWrapMode {
constexpr int32_t repeat(int32_t coord, int32_t size) {
	return ((coord % size) + size) % size;
}
constexpr int32_t clamp_edge(int32_t coord, int32_t size) {
	return std::clamp(coord, 0, size - 1);
}
} // namespace ImageWrapMode

using WrappingFunction = int32_t (*)(int32_t, int32_t);

class ImageMipView {
  public:
	const int32_t start_x, start_y, end_x, end_y;
	const uint32_t mip_width, mip_height, num_components;
	const int32_t width, height;
	constexpr ImageMipView(
		int32_t start_x,
		int32_t start_y,
		int32_t end_x,
		int32_t end_y,
		uint32_t mip_width,
		uint32_t mip_height,
		uint32_t num_components)
		: start_x(start_x), start_y(start_y), end_x(end_x), end_y(end_y),
		  mip_width(mip_width), mip_height(mip_height), num_components(num_components),
		  width(end_x - start_x), height(end_y - start_y) {}

	virtual FixedPoint::vec4f texelFetch(
		int32_t x, int32_t y,
		WrappingFunction wrap_x,
		WrappingFunction wrap_y) const = 0;

	virtual void setPixel(int32_t x, int32_t y, const FixedPoint::vec4f& data) = 0;

	constexpr void copyView(
		const ImageMipView& view,
		int32_t des_x,
		int32_t des_y,
		int32_t border,
		WrappingFunction wrap_x,
		WrappingFunction wrap_y) {
		for (int32_t y = -border; y < view.height + border; ++y) {
			for (int32_t x = -border; x < view.width + border; ++x) {
				FixedPoint::vec4f value = view.texelFetch(x, y, wrap_x, wrap_y);
				int32_t write_x = des_x + x;
				int32_t wirite_y = des_y + y;
				this->setPixel(write_x, wirite_y, value);
			}
		}
	}
};

template <ImageDataType T>
class ImageMipViewImplementation : public ImageMipView {
  public:
	T* mip_data;
	constexpr ImageMipViewImplementation(
		T* mip_data,
		int32_t start_x,
		int32_t start_y,
		int32_t end_x,
		int32_t end_y,
		uint32_t mip_width,
		uint32_t mip_height,
		uint32_t num_components) : ImageMipView(start_x, start_y, end_x, end_y, mip_width, mip_height, num_components), mip_data(mip_data) {}

	/**
	 * @param x The x coordinate in view coordinates.
	 * @param y The y coordinate in view coordinates.
	 * @param wrap_x Function to wrap x coordinate.
	 * @param wrap_y Function to wrap y coordinate.
	 */
	inline FixedPoint::vec4f texelFetch(
		int32_t x, int32_t y,
		WrappingFunction wrap_x,
		WrappingFunction wrap_y) const override {

		uint32_t mip_x = uint32_t(wrap_x(start_x + x, int32_t(this->mip_width)));
		uint32_t mip_y = uint32_t(wrap_y(start_y + y, int32_t(this->mip_height)));

		uint32_t idx = (mip_y * this->mip_width + mip_x) * this->num_components;
		FixedPoint::vec4f out(0.0f);
		for (uint32_t c = 0; c < num_components; ++c) {
			out[c] = static_cast<float>(this->mip_data[idx + c]);
		}
		return out;
	}

	constexpr void
	setPixel(int32_t x, int32_t y, const FixedPoint::vec4f& value) override {
		int32_t mip_x = start_x + x;
		int32_t mip_y = start_y + y;
		if (mip_x < 0 || mip_y < 0 || mip_x >= static_cast<int32_t>(this->mip_width) || mip_y >= static_cast<int32_t>(this->mip_height))
			return;
		uint32_t idx = (static_cast<uint32_t>(mip_y) * this->mip_width + static_cast<uint32_t>(mip_x)) * this->num_components;
		for (uint32_t c = 0; c < this->num_components; ++c) {
			this->mip_data[idx + c] = static_cast<T>(value[c]);
		}
	}
};

class ImageData {
  protected:
	void** data;
	uint32_t width;
	uint32_t height;
	uint32_t num_components;
	uint32_t num_mip_levels;
	uint32_t bytes_per_component;
	uint32_t num_stored_mip_levels;
	virtual void generateMipLevels() = 0;

  public:
	constexpr uint32_t getWidth() const {
		return this->width;
	}
	constexpr uint32_t getHeight() const {
		return this->height;
	}
	constexpr uint32_t getNumComponents() const {
		return this->num_components;
	}
	constexpr uint32_t getBytesPerComponent() const {
		return this->bytes_per_component;
	};
	constexpr uint32_t getBytesPerRow() const {
		return this->width * this->num_components * this->bytes_per_component;
	}
	constexpr uint32_t getNumMipLevels() const {
		return this->num_mip_levels;
	}
	constexpr uint32_t getNumStoredMipLevels() const {
		return this->num_stored_mip_levels;
	}
	constexpr uint32_t getMipWidth(uint32_t level) const {
		return std::max(1u, this->width >> level);
	}
	constexpr uint32_t getMipHeight(uint32_t level) const {
		return std::max(1u, this->height >> level);
	}
	constexpr uint32_t getMipBytesPerRow(uint32_t level) const {
		return getMipWidth(level) * this->num_components * this->bytes_per_component;
	}
	constexpr uint32_t getMipLevelByteSize(uint32_t level) const {
		return getMipWidth(level) * getMipHeight(level) * this->num_components * this->bytes_per_component;
	}
	virtual void setPixel(uint32_t x, uint32_t y, uint32_t mip_level, const FixedPoint::vec4f& value) = 0;
	emscripten::val getMipData(uint32_t level) const;
	inline ImageData(uint32_t width, uint32_t height, uint32_t num_components) : width(width), height(height), num_components(num_components) {
		this->num_mip_levels = 1 + static_cast<uint32_t>(std::floor(std::log2(std::max(width, height))));
		this->data = new void*[this->num_mip_levels];
	}
	virtual ~ImageData() = default;
	static ImageData* fromImageData(std::string data, bool gen_mip_maps);
};

template <ImageDataType T>
class ImageDataImplementation : public ImageData {
  protected:
	void generateMipLevels() override;

  public:
	using ImageData::ImageData;

	inline ~ImageDataImplementation() override {
		if (this->data) {
			for (uint32_t i = 0; i < this->num_stored_mip_levels; ++i) {
				delete[] static_cast<T*>(this->data[i]);
			}
			delete[] this->data;
		}
	}

	constexpr FixedPoint::vec4f texelFetch(uint32_t x, uint32_t y, uint32_t mip_level) const {
		uint32_t mip_width = this->getMipWidth(mip_level);
		const T* mip_data = static_cast<const T*>(this->data[mip_level]);
		uint32_t idx = (y * mip_width + x) * this->num_components;
		FixedPoint::vec4f out(0.0f);
		for (uint32_t c = 0; c < this->num_components; ++c) {
			out[c] = static_cast<float>(mip_data[idx + c]);
		}
		return out;
	}

	constexpr void setPixel(uint32_t x, uint32_t y, uint32_t mip_level, const FixedPoint::vec4f& value) override {
		uint32_t mip_width = this->getMipWidth(mip_level);
		T* mip_data = static_cast<T*>(this->data[mip_level]);
		uint32_t idx = (y * mip_width + x) * this->num_components;
		for (uint32_t c = 0; c < this->num_components; ++c) {
			mip_data[idx + c] = static_cast<T>(value[c]);
		}
	}
	static constexpr ImageDataImplementation<T>* empty(uint32_t width, uint32_t height, uint32_t num_components) {
		ImageDataImplementation<T>* image_data = new ImageDataImplementation<T>(width, height, num_components);
		image_data->bytes_per_component = static_cast<uint32_t>(sizeof(T));
		image_data->num_stored_mip_levels = 1;

		T* buffer = new T[width * height * num_components];
		for (uint32_t i = 0; i < width * height * num_components; ++i) {
			buffer[i] = T(0);
		}
		image_data->data[0] = buffer;
		return image_data;
	}

	constexpr ImageMipViewImplementation<T> getMipView(uint32_t mip_level) const {
		return ImageMipViewImplementation<T>(
			static_cast<T*>(this->data[mip_level]),
			0,
			0,
			static_cast<int32_t>(this->getMipWidth(mip_level)),
			static_cast<int32_t>(this->getMipHeight(mip_level)),
			this->getMipWidth(mip_level),
			this->getMipHeight(mip_level),
			this->num_components);
	}
};

} // namespace kayo
