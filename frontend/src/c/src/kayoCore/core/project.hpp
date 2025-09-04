#pragma once
#include "TimeLine.hpp"
#include "jsMap.hpp"
#include "renderConfig.hpp"

namespace kayo {
class Project {
  public:
	JsMap<kayo::config::RenderConfig> renderConfigs;
	TimeLine timeLine;
	Project();
};
} // namespace kayo
