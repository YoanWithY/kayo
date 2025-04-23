#pragma once

#include "fixed.hpp"
#include "vec2_forward.hpp"
#include "vec3_forward.hpp"
#include "vec4_forward.hpp"
#include <cstdint>

namespace FixedPoint {

template <class T>
class Vec4 {
  public:
	T x;
	T y;
	T z;
	T w;
	constexpr Vec4(const T& a) : x(a), y(a), z(a), w(a) {}
	constexpr Vec4(const T& x, const T& y, const T& z, const T& w) : x(x), y(y), z(z), w(w) {}
	constexpr Vec4(const Vec2<T>& a, const T& b, const T& c) : x(a.x), y(a.y), z(b), w(c) {}
	constexpr Vec4(const T& a, const Vec2<T>& b, const T& c) : x(a), y(b.x), z(b.y), w(c) {}
	constexpr Vec4(const T& a, const T& b, const Vec2<T>& c) : x(a), y(b), z(c.x), w(c.y) {}
	constexpr Vec4(const Vec2<T>& a, const Vec2<T>& b) : x(a.x), y(a.y), z(b.x), w(b.y) {}
	constexpr Vec4(const Vec3<T>& a, const T& b) : x(a.x), y(a.y), z(a.z), w(b) {}
	constexpr Vec4(const T& a, const Vec3<T>& b) : x(a), y(b.x), z(b.y), w(b.z) {}
	template <class K>
	constexpr Vec4(const K& a) : x(T(a.x)), y(T(a.y)), z(T(a.z)), w(T(a.w)) {}

	constexpr T operator[](uint32_t n) const {
		return reinterpret_cast<const T*>(this)[n];
	}

	constexpr Vec4<T> operator+(const Vec4<T>& other) const {
		return Vec4<T>(this->x + other.x, this->y + other.y, this->z + other.z, this->w + other.w);
	}

	constexpr Vec4<T> operator-(const Vec4<T>& other) const {
		return Vec4<T>(this->x - other.x, this->y - other.y, this->z - other.z, this->w - other.w);
	}

	constexpr Vec4<T> operator*(const Vec4<T>& other) const {
		return Vec4<T>(this->x * other.x, this->y * other.y, this->z * other.z, this->w * other.w);
	}

	constexpr Vec4<T> operator/(const Vec4<T>& other) const {
		return Vec4<T>(this->x / other.x, this->y / other.y, this->z / other.z, this->w / other.w);
	}

	constexpr T dot(const Vec3<T>& other) const {
		return this->x * other.x + this->y * other.y + this->z * other.z + this->w * other.w;
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

	constexpr Vec2<T> xw() const {
		return Vec2<T>(this->x, this->w);
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

	constexpr Vec2<T> yw() const {
		return Vec2<T>(this->y, this->w);
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

	constexpr Vec2<T> zw() const {
		return Vec2<T>(this->z, this->w);
	}

	constexpr Vec2<T> wx() const {
		return Vec2<T>(this->w, this->x);
	}

	constexpr Vec2<T> wy() const {
		return Vec2<T>(this->w, this->y);
	}

	constexpr Vec2<T> wz() const {
		return Vec2<T>(this->w, this->z);
	}

	constexpr Vec2<T> ww() const {
		return Vec2<T>(this->w, this->w);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Vec2<T>& vec) {
		os << "Vec4(" << vec.x << ", " << vec.y << ", " << vec.z << ", " << vec.w << ")";
		return os;
	}
};

template <class T>
constexpr T dot(const Vec4<T>& a, const Vec4<T>& b) {
	return a.dot(b);
}

} // namespace FixedPoint
