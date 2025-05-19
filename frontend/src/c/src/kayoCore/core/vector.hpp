#pragma once
#include <cstdint>

namespace kayo {

template <typename T>
class Vector2 {
  public:
	T x;
	T y;
	constexpr Vector2(const T& x, const T& y) : x(x), y(y) {};
};

template <typename T>
class Vector3 {
  public:
	T x;
	T y;
	T z;
	constexpr Vector3(const T& x, const T& y, const T& z) : x(x), y(y), z(z) {};
};

template <typename T>
class Vector4 {
  public:
	T x;
	T y;
	T z;
	T w;
	constexpr Vector4(const T& x, const T& y, const T& z, const T& w) : x(x), y(y), z(z), w(w) {};
};
} // namespace kayo