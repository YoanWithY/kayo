#include "createMipAtlas.hpp"
#include <algorithm>
#include <emscripten/em_asm.h>
#include <iostream>

namespace kayo {

CreateMipAtlasTask::CreateMipAtlasTask(uint32_t task_id, const ImageDataImplementation<uint8_t>& image_data) : Task(task_id), image_data(image_data) {}
constexpr uint32_t tile_size = 128;
constexpr uint32_t tile_border = 16;
constexpr uint32_t physical_tile_size = tile_size + 2 * tile_border;
constexpr uint32_t logical_largest_atlas_mip_size = 64; // must be power of two;
constexpr int32_t atlas_offsets[][2] = {
	{16, 16},
	{112, 16},
	{112, 80},
	{16, 128},
	{56, 128},
	{96, 128},
	{136, 128}};
const uint32_t num_mips_in_atlas = static_cast<uint32_t>(std::floor(std::log2(logical_largest_atlas_mip_size))) + 1;
constexpr uint32_t getFirstAtlasLevel(uint32_t width, uint32_t height) {
	return std::max(static_cast<uint32_t>(std::ceil(std::log2(float(std::max(width, height)) / float(logical_largest_atlas_mip_size)))), 0u);
}

static void* createMipAtlas(void* arg) {
	CreateMipAtlasTask* task = reinterpret_cast<CreateMipAtlasTask*>(arg);
	const ImageDataImplementation<uint8_t>& image_data = task->image_data;
	uint32_t byte_size = physical_tile_size * physical_tile_size * 4;
	ImageMipViewImplementation<uint8_t> write_view(
		new uint8_t[byte_size],
		0,
		0,
		physical_tile_size,
		physical_tile_size,
		physical_tile_size,
		physical_tile_size,
		4);
	uint32_t atlas_index = uint32_t(std::max(int32_t(num_mips_in_atlas) - int32_t(image_data.getNumMipLevels()), 0));
	uint32_t atlas_level = getFirstAtlasLevel(image_data.getWidth(), image_data.getHeight());
	for (; atlas_index < num_mips_in_atlas; atlas_index++, atlas_level++) {
		const ImageMipViewImplementation<uint8_t> view = image_data.getMipView(atlas_level);
		write_view.copyView(view, atlas_offsets[atlas_index][0], atlas_offsets[atlas_index][1], tile_border, ImageWrapMode::repeat, ImageWrapMode::repeat);
	}

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdollar-in-identifier-extension"
	MAIN_THREAD_ASYNC_EM_ASM({ window.kayo.taskQueue.taskFinished($0, {byteOffset : $1, byteLength : $2}); }, task->task_id, write_view.mip_data, byte_size);
#pragma GCC diagnostic pop
	pthread_detach(pthread_self());
	return nullptr;
}

void CreateMipAtlasTask::run() {
	pthread_t thread;
	int result = pthread_create(&thread, nullptr, &createMipAtlas, this);
	if (result != 0) {
		std::cerr << "Error: Unable to create thread, " << result << std::endl;
		return;
	}
	return;
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoAtlasTaskWASM) {
	class_<kayo::CreateMipAtlasTask, base<kayo::Task>>("WasmCreateAtlasTask")
		.constructor<uint32_t, kayo::ImageDataImplementation<uint8_t>&>()
		.function("run", &kayo::CreateMipAtlasTask::run);
}