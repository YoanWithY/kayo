#pragma once
#include <cstdint>
namespace kayo {
template <typename T>
void dispatchToJS(uint32_t pub_id, T* v);
}