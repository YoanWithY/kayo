#include "createMipAtlas.hpp"
#include <algorithm>
#include <emscripten/em_asm.h>
#include <iostream>

namespace kayo {

CreateMipAtlasTask::CreateMipAtlasTask(uint32_t task_id, const ImageDataImplementation<uint8_t>& image_data, const SVTConfig* svt_config)
	: Task(task_id), image_data(image_data), svt_config(svt_config) {}

constexpr uint32_t getFirstAtlasLevel(uint32_t width, uint32_t height, uint32_t largest_logical_mip_atlas_size_px) {
	return std::max(static_cast<uint32_t>(std::ceil(std::log2(float(std::max(width, height)) / float(largest_logical_mip_atlas_size_px)))), 0u);
}

static void* createMipAtlas(void* arg) {
	pthread_detach(pthread_self());
	CreateMipAtlasTask* task = reinterpret_cast<CreateMipAtlasTask*>(arg);
	const ImageDataImplementation<uint8_t>& image_data = task->image_data;
	const SVTConfig* svt_config = task->svt_config;
	uint32_t byte_size = svt_config->physical_tile_size_px * svt_config->physical_tile_size_px * 4;
	ImageMipViewImplementation<uint8_t> write_view(
		new uint8_t[byte_size],
		0,
		0,
		int32_t(svt_config->physical_tile_size_px),
		int32_t(svt_config->physical_tile_size_px),
		svt_config->physical_tile_size_px,
		svt_config->physical_tile_size_px,
		4);
	uint32_t mips_in_atlas = svt_config->atlas_offsets.size();
	uint32_t atlas_index = uint32_t(std::max(int32_t(mips_in_atlas) - int32_t(image_data.getNumMipLevels()), 0));
	uint32_t atlas_level = getFirstAtlasLevel(image_data.getWidth(), image_data.getHeight(), svt_config->largest_atlas_mip_size_px);
	for (; atlas_index < mips_in_atlas; atlas_index++, atlas_level++) {
		const ImageMipViewImplementation<uint8_t> view = image_data.getMipView(atlas_level);
		write_view.copyView(
			view,
			svt_config->atlas_offsets[atlas_index][0],
			svt_config->atlas_offsets[atlas_index][1],
			int32_t(svt_config->tile_border_px),
			ImageWrapMode::repeat,
			ImageWrapMode::repeat);
	}

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdollar-in-identifier-extension"
	MAIN_THREAD_ASYNC_EM_ASM({ window.kayo.taskQueue.wasmTaskFinished($0, {byteOffset : $1, byteLength : $2}); }, task->task_id, write_view.mip_data, byte_size);
#pragma GCC diagnostic pop
	return nullptr;
}

void CreateMipAtlasTask::run() {
	pthread_t thread;
	int result = pthread_create(&thread, nullptr, &createMipAtlas, this);
	if (result != 0)
		std::cerr << "Error: Unable to create thread, " << result << std::endl;
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoAtlasTaskWASM) {
	class_<kayo::CreateMipAtlasTask, base<kayo::Task>>("WasmCreateAtlasTask")
		.constructor<uint32_t, kayo::ImageDataImplementation<uint8_t>&, kayo::SVTConfig*>()
		.function("run", &kayo::CreateMipAtlasTask::run);
}