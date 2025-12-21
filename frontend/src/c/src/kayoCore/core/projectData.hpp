#pragma once
#include "SVTConfig.hpp"
#include "TimeLine.hpp"
#include "jsMap.hpp"

namespace kayo {
class ProjectData {
  public:
	TimeLine timeLine;
	SVTConfig svt_config;
	ProjectData();
};
} // namespace kayo
