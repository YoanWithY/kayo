#pragma once
#include "./JsInterop.hpp"
#include <cstdint>

namespace kayo {
class DataBlock {
  protected:
	uint32_t id;
	constexpr DataBlock(uint32_t id) : id(id) {}

  public:
	constexpr uint32_t getIDJS() const {
		return id;
	}

	constexpr void notifyObservers() const {
		kayoNotifyObservers(id);
	}
};
} // namespace kayo