#pragma once
#include "fixed.hpp"
#include <cstdint>

namespace FixedPoint {
template <class T>
class Mat2;

typedef Mat2<Number> mat2;
typedef Mat2<float> mat2f;
typedef Mat2<double> mat2d;
typedef Mat2<int32_t> mat2i;
typedef Mat2<uint32_t> mat2u;

} // namespace FixedPoint