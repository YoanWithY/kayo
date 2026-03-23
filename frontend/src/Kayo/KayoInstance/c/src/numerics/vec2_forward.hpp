#pragma once

#include "fixed.hpp"
#include <cstdint>

namespace FixedPoint {

template <class T>
class Vec2;

typedef Vec2<Number> vec2;
typedef Vec2<float> vec2f;
typedef Vec2<double> vec2d;
typedef Vec2<int32_t> vec2i;
typedef Vec2<uint32_t> vec2u;
} // namespace FixedPoint