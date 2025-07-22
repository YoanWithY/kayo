#pragma once
#include "../../utils/imageUtils.hpp"
#include "Task.hpp"
#include <cstdint>
#include <string>

namespace kayo {

class CreateMipAtlasTask : public Task {
  public:
	const ImageDataImplementation<uint8_t>& image_data;
	CreateMipAtlasTask(uint32_t task_id, const ImageDataImplementation<uint8_t>& image_data);
	void run() override;
};
} // namespace kayo