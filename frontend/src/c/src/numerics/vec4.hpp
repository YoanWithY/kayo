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
		switch (n) {
		case 0:
			return this->x;
		case 1:
			return this->y;
		case 2:
			return this->z;
		case 3:
			return this->w;
		default:
			throw std::range_error("Vec4 index out of range [0, 3]!");
		}
	}

	constexpr Vec4<T> operator+(const Vec4<T>& other) const {
		return Vec4<T>(this->x + other.x, this->y + other.y, this->z + other.z, this->w + other.w);
	}

	constexpr Vec4<T> operator+(const T& other) const {
		return Vec4<T>(this->x + other, this->y + other, this->z + other, this->w + other);
	}

	constexpr Vec4<T> operator-(const Vec4<T>& other) const {
		return Vec4<T>(this->x - other.x, this->y - other.y, this->z - other.z, this->w - other.w);
	}

	constexpr Vec4<T> operator-(const T& other) const {
		return Vec4<T>(this->x - other, this->y - other, this->z - other, this->w - other);
	}

	constexpr Vec4<T> operator*(const Vec4<T>& other) const {
		return Vec4<T>(this->x * other.x, this->y * other.y, this->z * other.z, this->w * other.w);
	}

	constexpr Vec4<T> operator*(const T& other) const {
		return Vec4<T>(this->x * other, this->y * other, this->z * other, this->w * other);
	}

	constexpr Vec4<T> operator/(const Vec4<T>& other) const {
		return Vec4<T>(this->x / other.x, this->y / other.y, this->z / other.z, this->w / other.w);
	}

	constexpr Vec4<T> operator/(const T& other) const {
		return Vec4<T>(this->x / other, this->y / other, this->z / other, this->w / other);
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

	constexpr Vec3<T> xxx() const {
		return Vec3<T>(this->x, this->x, this->x);
	}

	constexpr Vec3<T> xxy() const {
		return Vec3<T>(this->x, this->x, this->y);
	}

	constexpr Vec3<T> xxz() const {
		return Vec3<T>(this->x, this->x, this->z);
	}

	constexpr Vec3<T> xxw() const {
		return Vec3<T>(this->x, this->x, this->w);
	}

	constexpr Vec3<T> xyx() const {
		return Vec3<T>(this->x, this->y, this->x);
	}

	constexpr Vec3<T> xyy() const {
		return Vec3<T>(this->x, this->y, this->y);
	}

	constexpr Vec3<T> xyz() const {
		return Vec3<T>(this->x, this->y, this->z);
	}

	constexpr Vec3<T> xyw() const {
		return Vec3<T>(this->x, this->y, this->w);
	}

	constexpr Vec3<T> xzx() const {
		return Vec3<T>(this->x, this->z, this->x);
	}

	constexpr Vec3<T> xzy() const {
		return Vec3<T>(this->x, this->z, this->y);
	}

	constexpr Vec3<T> xzz() const {
		return Vec3<T>(this->x, this->z, this->z);
	}

	constexpr Vec3<T> xzw() const {
		return Vec3<T>(this->x, this->z, this->w);
	}

	constexpr Vec3<T> xwx() const {
		return Vec3<T>(this->x, this->w, this->x);
	}

	constexpr Vec3<T> xwy() const {
		return Vec3<T>(this->x, this->w, this->y);
	}

	constexpr Vec3<T> xwz() const {
		return Vec3<T>(this->x, this->w, this->z);
	}

	constexpr Vec3<T> xww() const {
		return Vec3<T>(this->x, this->w, this->w);
	}

	constexpr Vec3<T> yxx() const {
		return Vec3<T>(this->y, this->x, this->x);
	}

	constexpr Vec3<T> yxy() const {
		return Vec3<T>(this->y, this->x, this->y);
	}

	constexpr Vec3<T> yxz() const {
		return Vec3<T>(this->y, this->x, this->z);
	}

	constexpr Vec3<T> yxw() const {
		return Vec3<T>(this->y, this->x, this->w);
	}

	constexpr Vec3<T> yyx() const {
		return Vec3<T>(this->y, this->y, this->x);
	}

	constexpr Vec3<T> yyy() const {
		return Vec3<T>(this->y, this->y, this->y);
	}

	constexpr Vec3<T> yyz() const {
		return Vec3<T>(this->y, this->y, this->z);
	}

	constexpr Vec3<T> yyw() const {
		return Vec3<T>(this->y, this->y, this->w);
	}

	constexpr Vec3<T> yzx() const {
		return Vec3<T>(this->y, this->z, this->x);
	}

	constexpr Vec3<T> yzy() const {
		return Vec3<T>(this->y, this->z, this->y);
	}

	constexpr Vec3<T> yzz() const {
		return Vec3<T>(this->y, this->z, this->z);
	}

	constexpr Vec3<T> yzw() const {
		return Vec3<T>(this->y, this->z, this->w);
	}

	constexpr Vec3<T> ywx() const {
		return Vec3<T>(this->y, this->w, this->x);
	}

	constexpr Vec3<T> ywy() const {
		return Vec3<T>(this->y, this->w, this->y);
	}

	constexpr Vec3<T> ywz() const {
		return Vec3<T>(this->y, this->w, this->z);
	}

	constexpr Vec3<T> yww() const {
		return Vec3<T>(this->y, this->w, this->w);
	}

	constexpr Vec3<T> zxx() const {
		return Vec3<T>(this->z, this->x, this->x);
	}

	constexpr Vec3<T> zxy() const {
		return Vec3<T>(this->z, this->x, this->y);
	}

	constexpr Vec3<T> zxz() const {
		return Vec3<T>(this->z, this->x, this->z);
	}

	constexpr Vec3<T> zxw() const {
		return Vec3<T>(this->z, this->x, this->w);
	}

	constexpr Vec3<T> zyx() const {
		return Vec3<T>(this->z, this->y, this->x);
	}

	constexpr Vec3<T> zyy() const {
		return Vec3<T>(this->z, this->y, this->y);
	}

	constexpr Vec3<T> zyz() const {
		return Vec3<T>(this->z, this->y, this->z);
	}

	constexpr Vec3<T> zyw() const {
		return Vec3<T>(this->z, this->y, this->w);
	}

	constexpr Vec3<T> zzx() const {
		return Vec3<T>(this->z, this->z, this->x);
	}

	constexpr Vec3<T> zzy() const {
		return Vec3<T>(this->z, this->z, this->y);
	}

	constexpr Vec3<T> zzz() const {
		return Vec3<T>(this->z, this->z, this->z);
	}

	constexpr Vec3<T> zzw() const {
		return Vec3<T>(this->z, this->z, this->w);
	}

	constexpr Vec3<T> zwx() const {
		return Vec3<T>(this->z, this->w, this->x);
	}

	constexpr Vec3<T> zwy() const {
		return Vec3<T>(this->z, this->w, this->y);
	}

	constexpr Vec3<T> zwz() const {
		return Vec3<T>(this->z, this->w, this->z);
	}

	constexpr Vec3<T> zww() const {
		return Vec3<T>(this->z, this->w, this->w);
	}

	constexpr Vec3<T> wxx() const {
		return Vec3<T>(this->w, this->x, this->x);
	}

	constexpr Vec3<T> wxy() const {
		return Vec3<T>(this->w, this->x, this->y);
	}

	constexpr Vec3<T> wxz() const {
		return Vec3<T>(this->w, this->x, this->z);
	}

	constexpr Vec3<T> wxw() const {
		return Vec3<T>(this->w, this->x, this->w);
	}

	constexpr Vec3<T> wyx() const {
		return Vec3<T>(this->w, this->y, this->x);
	}

	constexpr Vec3<T> wyy() const {
		return Vec3<T>(this->w, this->y, this->y);
	}

	constexpr Vec3<T> wyz() const {
		return Vec3<T>(this->w, this->y, this->z);
	}

	constexpr Vec3<T> wyw() const {
		return Vec3<T>(this->w, this->y, this->w);
	}

	constexpr Vec3<T> wzx() const {
		return Vec3<T>(this->w, this->z, this->x);
	}

	constexpr Vec3<T> wzy() const {
		return Vec3<T>(this->w, this->z, this->y);
	}

	constexpr Vec3<T> wzz() const {
		return Vec3<T>(this->w, this->z, this->z);
	}

	constexpr Vec3<T> wzw() const {
		return Vec3<T>(this->w, this->z, this->w);
	}

	constexpr Vec3<T> wwx() const {
		return Vec3<T>(this->w, this->w, this->x);
	}

	constexpr Vec3<T> wwy() const {
		return Vec3<T>(this->w, this->w, this->y);
	}

	constexpr Vec3<T> wwz() const {
		return Vec3<T>(this->w, this->w, this->z);
	}

	constexpr Vec3<T> www() const {
		return Vec3<T>(this->w, this->w, this->w);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Vec4<T>& vec) {
		os << "Vec4(" << vec.x << ", " << vec.y << ", " << vec.z << ", " << vec.w << ")";
		return os;
	}
};

template <class T>
constexpr T dot(const Vec4<T>& a, const Vec4<T>& b) {
	return a.dot(b);
}

template <class T>
constexpr Vec4<T> operator+(const T& a, const Vec4<T>& b) {
	return b + a;
}

template <class T>
constexpr Vec4<T> operator-(const T& a, const Vec4<T>& b) {
	return Vec4<T>(a) - b;
}

template <class T>
constexpr Vec4<T> operator*(const T& a, const Vec4<T>& b) {
	return b * a;
}

template <class T>
constexpr Vec4<T> operator/(const T& a, const Vec4<T>& b) {
	return Vec4<T>(a) / b;
}

} // namespace FixedPoint
