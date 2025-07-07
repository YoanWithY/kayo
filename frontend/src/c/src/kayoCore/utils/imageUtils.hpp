#pragma once
#include <cstdint>
#include <string>
#include <vector>

class ImageData {
  private:
	int width;
	int height;
	int components;
	int bytes_per_component;

  public:
	std::vector<uint8_t> data;
	int getWidth() const;
	int getHeight() const;
	int getComponents() const;
	int getBytesPerComponent() const;
	static ImageData* fromImageData(std::string data);
};
