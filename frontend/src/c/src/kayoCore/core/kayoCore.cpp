#include "kayoCore.hpp"
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <emscripten/wasm_worker.h>

void run_in_worker() {
	EM_ASM({ console.log('Hello via EM_ASM'); });
}

namespace kayo {
WASMInstance::WASMInstance() {
	emscripten_wasm_worker_t worker = emscripten_malloc_wasm_worker(/*stackSize: */ 10240);
	emscripten_wasm_worker_post_function_v(worker, run_in_worker);
	std::cout << "Hello from the Kayo C++ WASM instance." << std::endl;
}

int32_t WASMInstance::registerModule(WASMModule& module) {
	if (this->modules.contains(module.name))
		return 1;

	module.pre_registration();
	this->modules.insert({module.name, &module});
	module.post_registration();
	return 0;
}

const std::map<std::string, WASMModule*>& WASMInstance::getModules() const {
	return this->modules;
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASM) {
	class_<kayo::WASMModule>("KayoWASMModule");
	class_<kayo::WASMInstance>("KayoWASMInstance")
		.constructor<>()
		.function("registerModule", &kayo::WASMInstance::registerModule);
}
