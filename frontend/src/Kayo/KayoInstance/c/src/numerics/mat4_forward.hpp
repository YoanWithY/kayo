#pragma once
#include "fixed.hpp"
#include <cstdint>

namespace FixedPoint {
template <class T>
class Mat4;

typedef Mat4<Number> mat4;
typedef Mat4<float> mat4f;
typedef Mat4<double> mat4d;
typedef Mat4<int32_t> mat4i;
typedef Mat4<uint32_t> mat4u;

} // namespace FixedPoint