#include "kayoCore.hpp"
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <emscripten/wasm_worker.h>

void run_in_worker() {
	EM_ASM({ console.log('Hello via EM_ASM'); });
}

namespace kayo {
KayoInstance::KayoInstance() {
	emscripten_wasm_worker_t worker = emscripten_malloc_wasm_worker(/*stackSize: */ 10240);
	emscripten_wasm_worker_post_function_v(worker, run_in_worker);
	std::cout << "Hello from the Kayo C++ WASM instance." << std::endl;
	this->mirrorStateToConfig();
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

void KayoInstance::mirrorStateToConfig() {
	this->project.mirrorToConfig(this->projectConfig);
}

} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoWASM) {
	class_<kayo::KayoModule>("KayoWASMModule");
	class_<kayo::KayoInstance>("KayoWASMInstance")
		.constructor<>()
		.function("registerModule", &kayo::KayoInstance::registerModule)
		.function("mirrorStateToConfig", &kayo::KayoInstance::mirrorStateToConfig)
		.property("projectConfig", &kayo::KayoInstance::projectConfig, return_value_policy::reference())
		.property("project", &kayo::KayoInstance::project, return_value_policy::reference());
}
