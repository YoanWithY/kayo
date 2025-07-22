#include "Task.hpp"
#include "../../utils/memUtils.hpp"
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <iostream>
#include <pthread.h>

namespace kayo {
Task::Task(uint32_t task_id) : task_id(task_id) {}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTaskWASM) {
	class_<kayo::Task>("WasmTask")
		.function("run", &kayo::Task::run);
}