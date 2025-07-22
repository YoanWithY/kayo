#include "kayoCore.hpp"
#include "../../utils/memUtils.hpp"
#include <cstdlib>
#include <ctime>
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <pthread.h>
#include <thread>

namespace kayo {
KayoInstance::KayoInstance() {}

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
