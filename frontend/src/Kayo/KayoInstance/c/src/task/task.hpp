#pragma once
#include <cstdint>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>

namespace kayo {

class Task {
  public:
	const uint32_t task_id;
	Task(uint32_t id);
	virtual void run() = 0;
	virtual ~Task() = default;
};

} // namespace kayo