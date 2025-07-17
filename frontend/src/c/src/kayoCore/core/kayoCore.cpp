#include "kayoCore.hpp"
#include "../utils/memUtils.hpp"
#include <cstdlib>
#include <ctime>
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <pthread.h>

void* run_in_worker(void* arg) {

	MAIN_THREAD_ASYNC_EM_ASM({
		console.log("Hello from proxied JS");
	});

	std::string s("Hello");
	workerWriteFile("my_dir", reinterpret_cast<std::string*>(arg)[0], s.c_str(), s.length());
	std::cout << "Hi from worker pthread." << std::endl;
	delete reinterpret_cast<std::string*>(arg);
	return nullptr;
}

namespace kayo {
KayoInstance::KayoInstance() {
	pthread_t thread;
	std::string* s = new std::string("thread 1");
	int result = pthread_create(&thread, nullptr, run_in_worker, s);
	if (result != 0) {
		std::cerr << "Error: Unable to create thread, " << result << std::endl;
	}

	s = new std::string("thread 2");
	result = pthread_create(&thread, nullptr, run_in_worker, s);
	if (result != 0) {
		std::cerr << "Error: Unable to create thread, " << result << std::endl;
	}

	std::cout << "Hello from the Kayo C++ WASM instance." << std::endl;
}

int32_t KayoInstance::registerModule(KayoModule& module) {
	if (this->modules.contains(module.name))
		return 1;

	module.pre_registration();
	this->modules.insert({module.name, &module});
	module.post_registration();
	return 0;
}

const std::map<std::string, KayoModule*>& KayoInstance::getModules() const {
	return this->modules;
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASM) {
	class_<kayo::KayoModule>("KayoWASMModule");
	class_<kayo::KayoInstance>("KayoWASMInstance")
		.constructor<>()
		.function("registerModule", &kayo::KayoInstance::registerModule)
		.property("project", &kayo::KayoInstance::project, return_value_policy::reference());
}
