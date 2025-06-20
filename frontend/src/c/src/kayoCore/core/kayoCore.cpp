#include "kayoCore.hpp"
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <pthread.h>

void* run_in_worker(void*) {
	std::cout << "Hi from worker pthread." << std::endl;

	MAIN_THREAD_ASYNC_EM_ASM({
		console.log("Hello from proxied JS");
	});
	return nullptr;
}

namespace kayo {
KayoInstance::KayoInstance() {
	pthread_t thread;
	int result = pthread_create(&thread, nullptr, run_in_worker, nullptr);
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
