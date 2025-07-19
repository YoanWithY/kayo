#include "Task.hpp"
#include "../utils/memUtils.hpp"
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <iostream>
#include <pthread.h>

namespace kayo {
Task::Task(uint32_t id) : id(id) {}
void Task::join() {
	std::cout << "join:" << this->thread << std::endl;
	pthread_join(this->thread, nullptr);
}
StoreDataTask::StoreDataTask(uint32_t id, std::string path, std::string file_name, std::string data) : Task(id), path(path), file_name(file_name), data(data) {}

void* workerStoreData(void* arg) {
	StoreDataTask* task = reinterpret_cast<StoreDataTask*>(arg);
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdollar-in-identifier-extension"
	MAIN_THREAD_ASYNC_EM_ASM({ window.kayo.wasmx.taskQueue.taskFinished($0, 0); }, task->id);
#pragma GCC diagnostic pop
	return nullptr;
}

void StoreDataTask::run() {
	int result = pthread_create(&(this->thread), nullptr, &workerStoreData, this);
	std::cout << "thread:" << this->thread << std::endl;
	if (result != 0) {
		std::cerr << "Error: Unable to create thread, " << result << std::endl;
		return;
	}
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoTaskWASM) {
	class_<kayo::Task>("WasmTask")
		.function("run", &kayo::Task::run)
		.function("join", &kayo::Task::join);
	class_<kayo::StoreDataTask, base<kayo::Task>>("WasmStoreDataTask")
		.constructor<uint32_t, std::string, std::string, std::string>();
}