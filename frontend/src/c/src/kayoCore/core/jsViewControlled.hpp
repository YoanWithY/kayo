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

template <typename T, typename W>
class JSViewControlled {
  public:
	T value;
	uint32_t observation_id;
	constexpr JSViewControlled() : observation_id(allocViewControlledID()) {}
	constexpr JSViewControlled(T value) : value(value), observation_id(allocViewControlledID()) {}
	void dispatchToObservers() {
		kayoDispatchToObserver(this->observation_id);
	}

	W getValueJS() const {
		return static_cast<W>(value);
	}

	void setValueJS(W wire_data) {
		this->value = static_cast<T>(wire_data);
		dispatchToObservers();
	}

	uint32_t getObservationID() const {
		return this->observation_id;
	}
};

typedef JSViewControlled<FixedPoint::Number, FixedPoint::NumberJSWireType> JSVCNumber;
typedef JSViewControlled<std::string, std::string> JSVCString;
typedef JSViewControlled<bool, bool> JSVCBoolean;

} // namespace kayo
