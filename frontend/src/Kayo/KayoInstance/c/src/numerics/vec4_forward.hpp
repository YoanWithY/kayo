#pragma once

#include "fixed.hpp"
#include <cstdint>

namespace FixedPoint {

template <class T>
class Vec4;
typedef Vec4<Number> vec4;
typedef Vec4<float> vec4f;
typedef Vec4<double> vec4d;
typedef Vec4<int32_t> vec4i;
typedef Vec4<uint32_t> vec4u;
} // namespace FixedPoint
