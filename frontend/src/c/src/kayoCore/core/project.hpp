#include "jsMap.hpp"
#include "renderState.hpp"

namespace kayo {
class Project {
  public:
	JsMap<kayo::state::RenderState> renderStates;
	Project();
};
} // namespace kayo