#include "memUtils.hpp"
#include <iostream>
#include <ranges>
#include <string_view>

static thread_local emscripten::val root = emscripten::val::global("navigator")["storage"].call<emscripten::val>("getDirectory").await();
static thread_local emscripten::val create_object = [] {
	emscripten::val o = emscripten::val::object();
	o.set("create", true);
	return o;
}();

void workerWriteFile(const std::string& path, const std::string& file_name, const void* data, uint32_t byte_length) {
	using namespace emscripten;
	val fd = root;

	for (auto&& dir : path | std::views::split(',')) {
		fd = fd.call<val>("getDirectoryHandle", std::string{dir.begin(), dir.end()}, create_object).await();
	}

	val file = fd.call<val>("getFileHandle", file_name, create_object).await();
	val access_handle = file.call<val>("createSyncAccessHandle").await();
	access_handle.call<val>("write", val(typed_memory_view(byte_length, static_cast<const uint8_t*>(data)))).await();
	access_handle.call<val>("close").await();
}

using namespace emscripten;
static val getBufferView(std::vector<uint8_t>& data) {
	return val(typed_memory_view(data.size(), data.data()));
}

EMSCRIPTEN_BINDINGS(KayoMemUtilsWASM) {
	register_vector<uint8_t>("VectorUInt8");
	function("getBufferView", &getBufferView);
}