#include "project.hpp"
#include <emscripten/bind.h>

namespace kayo {
Project::Project() {
	using namespace state;
	this->renderStates.set("realtime", new RenderState());
}
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoProjectWASM) {
	class_<kayo::JsMap<kayo::state::RenderState>>("RenderStatesMap")
		.function("get", &kayo::JsMap<kayo::state::RenderState>::get, allow_raw_pointers());
	class_<kayo::Project>("ProjectConfig")
		.property("renderStates", &kayo::Project::renderStates, return_value_policy::reference());
}