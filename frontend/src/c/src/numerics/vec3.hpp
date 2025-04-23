#pragma once

#include "fixed.hpp"
#include "vec2_forward.hpp"
#include "vec3_forward.hpp"
#include "vec4_forward.hpp"
#include <cstdint>

namespace FixedPoint {

template <class T>
class Vec3 {
  public:
	T x;
	T y;
	T z;
	constexpr Vec3(const T& a) : x(a), y(a), z(a) {}
	constexpr Vec3(const T& x, const T& y, const T& z) : x(x), y(y), z(z) {}
	constexpr Vec3(const Vec2<T>& a, const T& b) : x(a.x), y(a.y), z(b) {}
	constexpr Vec3(const T& a, const Vec2<T>& b) : x(a), y(b.x), z(b.y) {}
	template <class K>
	constexpr Vec3(const K& a) : x(T(a.x)), y(T(a.y)), z(T(a.z)) {}

	constexpr T operator[](uint32_t n) const {
		return reinterpret_cast<const T*>(this)[n];
	}

	constexpr Vec3<T> operator+(const Vec3<T>& other) const {
		return Vec3<T>(this->x + other.x, this->y + other.y, this->z + other.z);
	}

	constexpr Vec3<T> operator-(const Vec3<T>& other) const {
		return Vec3<T>(this->x - other.x, this->y - other.y, this->z - other.z);
	}

	constexpr Vec3<T> operator*(const Vec3<T>& other) const {
		return Vec3<T>(this->x * other.x, this->y * other.y, this->z * other.z);
	}

	constexpr Vec3<T> operator/(const Vec3<T>& other) const {
		return Vec3<T>(this->x / other.x, this->y / other.y, this->z / other.z);
	}

	constexpr T dot(const Vec3<T>& other) const {
		return this->x * other.x + this->y * other.y + this->z * other.z;
	}

	constexpr Vec2<T> xx() const {
		return Vec2<T>(this->x, this->x);
	}

	constexpr Vec2<T> xy() const {
		return Vec2(this->x, this->y);
	}

	constexpr Vec2<T> xz() const {
		return Vec2<T>(this->x, this->z);
	}

	constexpr Vec2<T> yx() const {
		return Vec2<T>(this->y, this->x);
	}

	constexpr Vec2<T> yy() const {
		return Vec2<T>(this->y, this->y);
	}

	constexpr Vec2<T> yz() const {
		return Vec2<T>(this->y, this->z);
	}

	constexpr Vec2<T> zx() const {
		return Vec2<T>(this->z, this->x);
	}

	constexpr Vec2<T> zy() const {
		return Vec2<T>(this->z, this->y);
	}

	constexpr Vec2<T> zz() const {
		return Vec2<T>(this->z, this->z);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Vec2<T>& vec) {
		os << "Vec3(" << vec.x << ", " << vec.y << ", " << vec.z << ")";
		return os;
	}
};

template <class T>
constexpr T dot(const Vec3<T>& a, const Vec3<T>& b) {
	return a.dot(b);
}

template <class T>
constexpr Vec3<T> operator*(const T& a, const Vec3<T>& b) {
	return b * a;
}

} // namespace FixedPoint
