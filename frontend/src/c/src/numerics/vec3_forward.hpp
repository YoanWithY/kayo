#pragma once

#include "fixed.hpp"
#include <cstdint>

namespace FixedPoint {

template <class T>
class Vec3;

typedef Vec3<Number> vec3;
typedef Vec3<float> vec3f;
typedef Vec3<double> vec3d;
typedef Vec3<int32_t> vec3i;
typedef Vec3<uint32_t> vec3u;
} // namespace FixedPoint
