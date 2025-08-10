#pragma once

#include "../../numerics/fixedMath.hpp"
#include <iostream>
#include <stdint.h>
#include <string>

extern "C" {
extern void kayoDispatchToObserver(uint32_t id);
}

namespace kayo {

uint32_t allocViewControlledID();

template <typename T>
concept JSViewControllable =
	requires(const char* cstr, std::size_t len, T t) {
		T{cstr, len};
		static_cast<std::string>(t);
	};

template <JSViewControllable T>
class JSViewControlled {
  public:
	T value;
	uint32_t observation_id;
	constexpr JSViewControlled() : value(), observation_id(allocViewControlledID()) {}
	constexpr JSViewControlled(T value) : value(value), observation_id(allocViewControlledID()) {}
	void dispatchToObservers() {
		kayoDispatchToObserver(this->observation_id);
	}

	std::string getValueJS() const {
		return static_cast<std::string>(value);
	}

	void setValueJS(std::string str_value) {
		value = T(str_value.c_str(), str_value.length());
		dispatchToObservers();
	}

	uint32_t getObservationID() const {
		return this->observation_id;
	}
};

typedef JSViewControlled<FixedPoint::Number> JSVCNumber;
typedef JSViewControlled<std::string> JSVCString;

} // namespace kayo
