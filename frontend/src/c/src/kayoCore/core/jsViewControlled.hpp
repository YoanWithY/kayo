#pragma once

#include "../../numerics/fixedMath.hpp"
#include <stdint.h>
#include <string>

extern "C" {
extern void kayoDispatchToObserver(uint32_t id, std::string value);
}

namespace kayo {

uint32_t allocViewControlledID();

template <typename T>
concept JSViewControllable = requires(T t, const void* ptr, size_t size) {
	{ t.observeValue() } -> std::same_as<std::string>;
	T{ptr, size};
};

template <JSViewControllable T>
class JSViewControlled {
  private:
  public:
	T value;
	const uint32_t observation_id;
	JSViewControlled(T value) : value(value), observation_id(allocViewControlledID()) {}
	void dispatchToObservers() {
		kayoDispatchToObserver(this->observation_id, this->value.observeValue());
	};

	std::string getValueJS() {
		return value.observeValue();
	};
	void setValueJS(std::string str_value) {
		value = T(reinterpret_cast<const void*>(str_value.c_str()), str_value.length());
		dispatchToObservers();
	};
};

typedef JSViewControlled<FixedPoint::Number> JSVCNumber;

} // namespace kayo