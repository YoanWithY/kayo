#include "jsViewControlled.hpp"
#include "../../numerics/fixedMath.hpp"
#include <stdint.h>
#include <string>

extern "C" {
extern void kayoDispatchUint32ToObserver(uint32_t pub_id, uint32_t value);
extern void kayoDispatchFixedPointToObserver(uint32_t pub_id, uintptr_t ptr);
extern void kayoDispatchStringToObserver(uint32_t pub_id, const char* value);
extern void kayoDispatchBooleanToObserver(uintptr_t pub_id, bool value);
}

namespace kayo {
template <>
void dispatchToJS<uint32_t>(uint32_t pub_id, uint32_t* v) {
	kayoDispatchUint32ToObserver(pub_id, *v);
}

template <>
void dispatchToJS<FixedPoint::Number>(uint32_t pub_id, FixedPoint::Number* v) {
	kayoDispatchFixedPointToObserver(pub_id, reinterpret_cast<uintptr_t>(v));
}

template <>
void dispatchToJS<std::string>(uint32_t pub_id, std::string* v) {
	kayoDispatchStringToObserver(pub_id, v->c_str());
}

template <>
void dispatchToJS<bool>(uint32_t pub_id, bool* v) {
	kayoDispatchBooleanToObserver(pub_id, *v);
}

} // namespace kayo