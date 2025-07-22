#pragma once

#include "fixed.hpp"
#include "vec2_forward.hpp"
#include "vec3_forward.hpp"
#include "vec4_forward.hpp"
#include <cstdint>

namespace FixedPoint {

template <class T>
class Vec2 {
  public:
	T x;
	T y;
	constexpr Vec2(const T& a) : x(a), y(a) {}
	constexpr Vec2(const T& x, const T& y) : x(x), y(y) {}
	template <class K>
	constexpr Vec2(const Vec2<K>& v) : x(T(v.x)), y(T(v.y)) {}

	constexpr Vec2<T> operator+(const Vec2<T>& other) const {
		return Vec2<T>(this->x + other.x, this->y + other.y);
	}

	constexpr Vec2<T> operator+(const T& other) const {
		return Vec2<T>(this->x + other, this->y + other);
	}

	constexpr Vec2<T> operator-(const Vec2<T>& other) const {
		return Vec2<T>(this->x - other.x, this->y - other.y);
	}

	constexpr Vec2<T> operator-(const T& other) const {
		return Vec2<T>(this->x - other, this->y - other);
	}

	constexpr Vec2<T> operator*(const Vec2<T>& other) const {
		return Vec2<T>(this->x * other.x, this->y * other.y);
	}

	constexpr Vec2<T> operator*(const T& other) const {
		return Vec2<T>(this->x * other, this->y * other);
	}

	constexpr Vec2<T> operator/(const Vec2<T>& other) const {
		return Vec2<T>(this->x / other.x, this->y / other.y);
	}

	constexpr Vec2<T> operator/(const T& other) const {
		return Vec2<T>(this->x / other, this->y / other);
	}

	constexpr T operator[](uint32_t n) const {
		return reinterpret_cast<const T*>(this)[n];
	}

	constexpr T& operator[](uint32_t n) {
		return reinterpret_cast<T*>(this)[n];
	}

	constexpr T dot(const Vec2<T>& other) const {
		return this->x * other.x + this->y * other.y;
	}

	constexpr Vec2<T> positveNormal() const {
		return Vec2<T>(-this->y, this->x);
	}

	constexpr Vec2<T> negativeNormal() const {
		return Vec2<T>(this->y, -this->x);
	}

	constexpr Vec2<T> xx() const {
		return Vec2<T>(this->x, this->x);
	}

	constexpr Vec2<T> xy() const {
		return Vec2<T>(this->x, this->y);
	}

	constexpr Vec2<T> yx() const {
		return Vec2<T>(this->y, this->x);
	}

	constexpr Vec2<T> yy() const {
		return Vec2<T>(this->y, this->y);
	}

	constexpr Vec3<T> xxx() const {
		return Vec3<T>(this->x, this->x, this->x);
	}

	constexpr Vec3<T> xxy() const {
		return Vec3<T>(this->x, this->x, this->y);
	}

	constexpr Vec3<T> xyx() const {
		return Vec3<T>(this->x, this->y, this->x);
	}

	constexpr Vec3<T> xyy() const {
		return Vec3<T>(this->x, this->y, this->y);
	}

	constexpr Vec3<T> yxx() const {
		return Vec3<T>(this->y, this->x, this->x);
	}

	constexpr Vec3<T> yxy() const {
		return Vec3<T>(this->y, this->x, this->y);
	}

	constexpr Vec3<T> yyx() const {
		return Vec3<T>(this->y, this->y, this->x);
	}

	constexpr Vec3<T> yyy() const {
		return Vec3<T>(this->y, this->y, this->y);
	}

	constexpr Vec4<T> xxxx() const {
		return Vec4<T>(this->x, this->x, this->x, this->x);
	}

	constexpr Vec4<T> xxxy() const {
		return Vec4<T>(this->x, this->x, this->x, this->y);
	}

	constexpr Vec4<T> xxyx() const {
		return Vec4<T>(this->x, this->x, this->y, this->x);
	}

	constexpr Vec4<T> xxyy() const {
		return Vec4<T>(this->x, this->x, this->y, this->y);
	}

	constexpr Vec4<T> xyxx() const {
		return Vec4<T>(this->x, this->y, this->x, this->x);
	}

	constexpr Vec4<T> xyxy() const {
		return Vec4<T>(this->x, this->y, this->x, this->y);
	}

	constexpr Vec4<T> xyyx() const {
		return Vec4<T>(this->x, this->y, this->y, this->x);
	}

	constexpr Vec4<T> xyyy() const {
		return Vec4<T>(this->x, this->y, this->y, this->y);
	}

	constexpr Vec4<T> yxxx() const {
		return Vec4<T>(this->y, this->x, this->x, this->x);
	}

	constexpr Vec4<T> yxxy() const {
		return Vec4<T>(this->y, this->x, this->x, this->y);
	}

	constexpr Vec4<T> yxyx() const {
		return Vec4<T>(this->y, this->x, this->y, this->x);
	}

	constexpr Vec4<T> yxyy() const {
		return Vec4<T>(this->y, this->x, this->y, this->y);
	}

	constexpr Vec4<T> yyxx() const {
		return Vec4<T>(this->y, this->y, this->x, this->x);
	}

	constexpr Vec4<T> yyxy() const {
		return Vec4<T>(this->y, this->y, this->x, this->y);
	}

	constexpr Vec4<T> yyyx() const {
		return Vec4<T>(this->y, this->y, this->y, this->x);
	}

	constexpr Vec4<T> yyyy() const {
		return Vec4<T>(this->y, this->y, this->y, this->y);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Vec2<T>& vec) {
		os << "Vec2(" << vec.x << ", " << vec.y << ")";
		return os;
	}
};

template <class T>
constexpr T dot(const Vec2<T>& a, const Vec2<T>& b) {
	return a.dot(b);
}

template <class T>
constexpr Vec2<T> operator+(const T& a, const Vec2<T>& b) {
	return b + a;
}

template <class T>
constexpr Vec2<T> operator-(const T& a, const Vec2<T>& b) {
	return Vec2<T>(a) - b;
}

template <class T>
constexpr Vec2<T> operator*(const T& a, const Vec2<T>& b) {
	return b * a;
}

template <class T>
constexpr Vec2<T> operator/(const T& a, const Vec2<T>& b) {
	return Vec2<T>(a) / b;
}

} // namespace FixedPoint