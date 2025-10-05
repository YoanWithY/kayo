#pragma once
#include "SVTConfig.hpp"
#include "TimeLine.hpp"
#include "jsMap.hpp"
#include "renderConfig.hpp"

namespace kayo {
class Project {
  public:
	JsMap<kayo::config::RenderConfig> renderConfigs;
	TimeLine timeLine;
	SVTConfig svt_config;
	Project();
};
} // namespace kayo
