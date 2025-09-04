#include "jsViewControlled.hpp"
#include "../../numerics/fixedMath.hpp"
#include <stdint.h>
#include <string>

extern "C" {
extern void kayoDispatchUint32ToObserver(uintptr_t ptr, uint32_t value);
extern void kayoDispatchFixedPointToObserver(uintptr_t ptr);
extern void kayoDispatchStringToObserver(uintptr_t ptr, const char* value);
extern void kayoDispatchBooleanToObserver(uintptr_t ptr, bool value);
}

namespace kayo {
template <>
void dispatchToJS<uint32_t>(uint32_t* v) {
	kayoDispatchUint32ToObserver(reinterpret_cast<uintptr_t>(v), *v);
}

template <>
void dispatchToJS<FixedPoint::Number>(FixedPoint::Number* v) {
	kayoDispatchFixedPointToObserver(reinterpret_cast<uintptr_t>(v));
}

template <>
void dispatchToJS<std::string>(std::string* v) {
	kayoDispatchStringToObserver(reinterpret_cast<uintptr_t>(v), v->c_str());
}

template <>
void dispatchToJS<bool>(bool* v) {
	kayoDispatchBooleanToObserver(reinterpret_cast<uintptr_t>(v), *v);
}
} // namespace kayo