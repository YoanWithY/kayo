#pragma once
#include "fixed.hpp"
#include <cstdint>

namespace FixedPoint {
template <class T>
class Mat3;

typedef Mat3<Number> mat3;
typedef Mat3<float> mat3f;
typedef Mat3<double> mat3d;
typedef Mat3<int32_t> mat3i;
typedef Mat3<uint32_t> mat3u;

} // namespace FixedPoint