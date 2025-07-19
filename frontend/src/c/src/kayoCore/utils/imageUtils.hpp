#pragma once
#include <algorithm>
#include <cstdint>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>

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
	emscripten::val getMipData(uint32_t level) const;
	inline ImageData(uint32_t width, uint32_t height, uint32_t num_components) : width(width), height(height), num_components(num_components) {
		this->num_mip_levels = 1 + static_cast<uint32_t>(std::floor(std::log2(std::max(width, height))));
		this->data = new void*[this->num_mip_levels];
	}
	virtual ~ImageData() = default;
	static ImageData* fromImageData(std::string data);
};

template <typename T>
concept ImageDataType = std::same_as<T, uint8_t> || std::same_as<T, uint16_t> || std::same_as<T, float>;

template <ImageDataType T>
class ImageDataImplempentation : public ImageData {
  protected:
	void generateMipLevels() override;

  public:
	using ImageData::ImageData;

	inline ~ImageDataImplempentation() override {
		if (this->data) {
			for (uint32_t i = 0; i < this->num_stored_mip_levels; ++i) {
				delete[] static_cast<T*>(this->data[i]);
			}
			delete[] this->data;
		}
	}

	constexpr T getComponent(uint32_t x, uint32_t y, uint32_t mip_level, uint32_t mip_width, uint32_t component) const {
		return static_cast<const T*>(this->data[mip_level])[(y * mip_width + x) * this->num_components + component];
	}
};
