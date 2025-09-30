#include "project.hpp"
#include <emscripten/bind.h>

namespace kayo {
Project::Project() {
	using namespace config;
	this->renderConfigs.set("realtime default", new RenderConfig("realtime default"));
	this->timeLine.framesPerSecond = 30;
	this->timeLine.simulationTime = 0;
	this->timeLine.simulationTimeVelocity.create();
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoProjectWASM) {
	class_<kayo::JsMap<kayo::config::RenderConfig>>("RenderConfigMap")
		.function("get", &kayo::JsMap<kayo::config::RenderConfig>::get, allow_raw_pointers());
	class_<kayo::Project>("ProjectConfig")
		.property("renderConfigs", &kayo::Project::renderConfigs, return_value_policy::reference())
		.property("timeLine", &kayo::Project::timeLine, return_value_policy::reference());
}