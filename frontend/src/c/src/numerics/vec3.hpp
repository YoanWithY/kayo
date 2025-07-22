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
	constexpr Vec3(const Vec3<K>& a) : x(T(a.x)), y(T(a.y)), z(T(a.z)) {}

	constexpr T operator[](uint32_t n) const {
		return reinterpret_cast<const T*>(this)[n];
	}

	constexpr T& operator[](uint32_t n) {
		return reinterpret_cast<T*>(this)[n];
	}

	constexpr Vec3<T> operator+(const Vec3<T>& other) const {
		return Vec3<T>(this->x + other.x, this->y + other.y, this->z + other.z);
	}

	constexpr Vec3<T> operator+(const T& other) const {
		return Vec3<T>(this->x + other, this->y + other, this->z + other);
	}

	constexpr Vec3<T> operator-(const Vec3<T>& other) const {
		return Vec3<T>(this->x - other.x, this->y - other.y, this->z - other.z);
	}

	constexpr Vec3<T> operator-(const T& other) const {
		return Vec3<T>(this->x - other, this->y - other, this->z - other);
	}

	constexpr Vec3<T> operator*(const Vec3<T>& other) const {
		return Vec3<T>(this->x * other.x, this->y * other.y, this->z * other.z);
	}

	constexpr Vec3<T> operator*(const T& other) const {
		return Vec3<T>(this->x * other, this->y * other, this->z * other);
	}

	constexpr Vec3<T> operator/(const Vec3<T>& other) const {
		return Vec3<T>(this->x / other.x, this->y / other.y, this->z / other.z);
	}

	constexpr Vec3<T> operator/(const T& other) const {
		return Vec3<T>(this->x / other, this->y / other, this->z / other);
	}

	constexpr T dot(const Vec3<T>& other) const {
		return this->x * other.x + this->y * other.y + this->z * other.z;
	}

	constexpr Vec3<T> cross(const Vec3<T>& other) const {
		return Vec3<T>(this->y * other.z - this->z * other.y, this->z * other.x - this->x * other.z, this->x * other.y - this->y * other.x);
	}

	constexpr Vec2<T> xx() const {
		return Vec2<T>(this->x, this->x);
	}

	constexpr Vec2<T> xy() const {
		return Vec2<T>(this->x, this->y);
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

	constexpr Vec3<T> xxx() const {
		return Vec3<T>(this->x, this->x, this->x);
	}

	constexpr Vec3<T> xxy() const {
		return Vec3<T>(this->x, this->x, this->y);
	}

	constexpr Vec3<T> xxz() const {
		return Vec3<T>(this->x, this->x, this->z);
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

	constexpr Vec3<T> xzx() const {
		return Vec3<T>(this->x, this->z, this->x);
	}

	constexpr Vec3<T> xzy() const {
		return Vec3<T>(this->x, this->z, this->y);
	}

	constexpr Vec3<T> xzz() const {
		return Vec3<T>(this->x, this->z, this->z);
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

	constexpr Vec3<T> yyx() const {
		return Vec3<T>(this->y, this->y, this->x);
	}

	constexpr Vec3<T> yyy() const {
		return Vec3<T>(this->y, this->y, this->y);
	}

	constexpr Vec3<T> yyz() const {
		return Vec3<T>(this->y, this->y, this->z);
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

	constexpr Vec3<T> zxx() const {
		return Vec3<T>(this->z, this->x, this->x);
	}

	constexpr Vec3<T> zxy() const {
		return Vec3<T>(this->z, this->x, this->y);
	}

	constexpr Vec3<T> zxz() const {
		return Vec3<T>(this->z, this->x, this->z);
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

	constexpr Vec3<T> zzx() const {
		return Vec3<T>(this->z, this->z, this->x);
	}

	constexpr Vec3<T> zzy() const {
		return Vec3<T>(this->z, this->z, this->y);
	}

	constexpr Vec3<T> zzz() const {
		return Vec3<T>(this->z, this->z, this->z);
	}

	constexpr Vec4<T> xxxx() const {
		return Vec4<T>(this->x, this->x, this->x, this->x);
	}

	constexpr Vec4<T> xxxy() const {
		return Vec4<T>(this->x, this->x, this->x, this->y);
	}

	constexpr Vec4<T> xxxz() const {
		return Vec4<T>(this->x, this->x, this->x, this->z);
	}

	constexpr Vec4<T> xxyx() const {
		return Vec4<T>(this->x, this->x, this->y, this->x);
	}

	constexpr Vec4<T> xxyy() const {
		return Vec4<T>(this->x, this->x, this->y, this->y);
	}

	constexpr Vec4<T> xxyz() const {
		return Vec4<T>(this->x, this->x, this->y, this->z);
	}

	constexpr Vec4<T> xxzx() const {
		return Vec4<T>(this->x, this->x, this->z, this->x);
	}

	constexpr Vec4<T> xxzy() const {
		return Vec4<T>(this->x, this->x, this->z, this->y);
	}

	constexpr Vec4<T> xxzz() const {
		return Vec4<T>(this->x, this->x, this->z, this->z);
	}

	constexpr Vec4<T> xyxx() const {
		return Vec4<T>(this->x, this->y, this->x, this->x);
	}

	constexpr Vec4<T> xyxy() const {
		return Vec4<T>(this->x, this->y, this->x, this->y);
	}

	constexpr Vec4<T> xyxz() const {
		return Vec4<T>(this->x, this->y, this->x, this->z);
	}

	constexpr Vec4<T> xyyx() const {
		return Vec4<T>(this->x, this->y, this->y, this->x);
	}

	constexpr Vec4<T> xyyy() const {
		return Vec4<T>(this->x, this->y, this->y, this->y);
	}

	constexpr Vec4<T> xyyz() const {
		return Vec4<T>(this->x, this->y, this->y, this->z);
	}

	constexpr Vec4<T> xyzx() const {
		return Vec4<T>(this->x, this->y, this->z, this->x);
	}

	constexpr Vec4<T> xyzy() const {
		return Vec4<T>(this->x, this->y, this->z, this->y);
	}

	constexpr Vec4<T> xyzz() const {
		return Vec4<T>(this->x, this->y, this->z, this->z);
	}

	constexpr Vec4<T> xzxx() const {
		return Vec4<T>(this->x, this->z, this->x, this->x);
	}

	constexpr Vec4<T> xzxy() const {
		return Vec4<T>(this->x, this->z, this->x, this->y);
	}

	constexpr Vec4<T> xzxz() const {
		return Vec4<T>(this->x, this->z, this->x, this->z);
	}

	constexpr Vec4<T> xzyx() const {
		return Vec4<T>(this->x, this->z, this->y, this->x);
	}

	constexpr Vec4<T> xzyy() const {
		return Vec4<T>(this->x, this->z, this->y, this->y);
	}

	constexpr Vec4<T> xzyz() const {
		return Vec4<T>(this->x, this->z, this->y, this->z);
	}

	constexpr Vec4<T> xzzx() const {
		return Vec4<T>(this->x, this->z, this->z, this->x);
	}

	constexpr Vec4<T> xzzy() const {
		return Vec4<T>(this->x, this->z, this->z, this->y);
	}

	constexpr Vec4<T> xzzz() const {
		return Vec4<T>(this->x, this->z, this->z, this->z);
	}

	constexpr Vec4<T> yxxx() const {
		return Vec4<T>(this->y, this->x, this->x, this->x);
	}

	constexpr Vec4<T> yxxy() const {
		return Vec4<T>(this->y, this->x, this->x, this->y);
	}

	constexpr Vec4<T> yxxz() const {
		return Vec4<T>(this->y, this->x, this->x, this->z);
	}

	constexpr Vec4<T> yxyx() const {
		return Vec4<T>(this->y, this->x, this->y, this->x);
	}

	constexpr Vec4<T> yxyy() const {
		return Vec4<T>(this->y, this->x, this->y, this->y);
	}

	constexpr Vec4<T> yxyz() const {
		return Vec4<T>(this->y, this->x, this->y, this->z);
	}

	constexpr Vec4<T> yxzx() const {
		return Vec4<T>(this->y, this->x, this->z, this->x);
	}

	constexpr Vec4<T> yxzy() const {
		return Vec4<T>(this->y, this->x, this->z, this->y);
	}

	constexpr Vec4<T> yxzz() const {
		return Vec4<T>(this->y, this->x, this->z, this->z);
	}

	constexpr Vec4<T> yyxx() const {
		return Vec4<T>(this->y, this->y, this->x, this->x);
	}

	constexpr Vec4<T> yyxy() const {
		return Vec4<T>(this->y, this->y, this->x, this->y);
	}

	constexpr Vec4<T> yyxz() const {
		return Vec4<T>(this->y, this->y, this->x, this->z);
	}

	constexpr Vec4<T> yyyx() const {
		return Vec4<T>(this->y, this->y, this->y, this->x);
	}

	constexpr Vec4<T> yyyy() const {
		return Vec4<T>(this->y, this->y, this->y, this->y);
	}

	constexpr Vec4<T> yyyz() const {
		return Vec4<T>(this->y, this->y, this->y, this->z);
	}

	constexpr Vec4<T> yyzx() const {
		return Vec4<T>(this->y, this->y, this->z, this->x);
	}

	constexpr Vec4<T> yyzy() const {
		return Vec4<T>(this->y, this->y, this->z, this->y);
	}

	constexpr Vec4<T> yyzz() const {
		return Vec4<T>(this->y, this->y, this->z, this->z);
	}

	constexpr Vec4<T> yzxx() const {
		return Vec4<T>(this->y, this->z, this->x, this->x);
	}

	constexpr Vec4<T> yzxy() const {
		return Vec4<T>(this->y, this->z, this->x, this->y);
	}

	constexpr Vec4<T> yzxz() const {
		return Vec4<T>(this->y, this->z, this->x, this->z);
	}

	constexpr Vec4<T> yzyx() const {
		return Vec4<T>(this->y, this->z, this->y, this->x);
	}

	constexpr Vec4<T> yzyy() const {
		return Vec4<T>(this->y, this->z, this->y, this->y);
	}

	constexpr Vec4<T> yzyz() const {
		return Vec4<T>(this->y, this->z, this->y, this->z);
	}

	constexpr Vec4<T> yzzx() const {
		return Vec4<T>(this->y, this->z, this->z, this->x);
	}

	constexpr Vec4<T> yzzy() const {
		return Vec4<T>(this->y, this->z, this->z, this->y);
	}

	constexpr Vec4<T> yzzz() const {
		return Vec4<T>(this->y, this->z, this->z, this->z);
	}

	constexpr Vec4<T> zxxx() const {
		return Vec4<T>(this->z, this->x, this->x, this->x);
	}

	constexpr Vec4<T> zxxy() const {
		return Vec4<T>(this->z, this->x, this->x, this->y);
	}

	constexpr Vec4<T> zxxz() const {
		return Vec4<T>(this->z, this->x, this->x, this->z);
	}

	constexpr Vec4<T> zxyx() const {
		return Vec4<T>(this->z, this->x, this->y, this->x);
	}

	constexpr Vec4<T> zxyy() const {
		return Vec4<T>(this->z, this->x, this->y, this->y);
	}

	constexpr Vec4<T> zxyz() const {
		return Vec4<T>(this->z, this->x, this->y, this->z);
	}

	constexpr Vec4<T> zxzx() const {
		return Vec4<T>(this->z, this->x, this->z, this->x);
	}

	constexpr Vec4<T> zxzy() const {
		return Vec4<T>(this->z, this->x, this->z, this->y);
	}

	constexpr Vec4<T> zxzz() const {
		return Vec4<T>(this->z, this->x, this->z, this->z);
	}

	constexpr Vec4<T> zyxx() const {
		return Vec4<T>(this->z, this->y, this->x, this->x);
	}

	constexpr Vec4<T> zyxy() const {
		return Vec4<T>(this->z, this->y, this->x, this->y);
	}

	constexpr Vec4<T> zyxz() const {
		return Vec4<T>(this->z, this->y, this->x, this->z);
	}

	constexpr Vec4<T> zyyx() const {
		return Vec4<T>(this->z, this->y, this->y, this->x);
	}

	constexpr Vec4<T> zyyy() const {
		return Vec4<T>(this->z, this->y, this->y, this->y);
	}

	constexpr Vec4<T> zyyz() const {
		return Vec4<T>(this->z, this->y, this->y, this->z);
	}

	constexpr Vec4<T> zyzx() const {
		return Vec4<T>(this->z, this->y, this->z, this->x);
	}

	constexpr Vec4<T> zyzy() const {
		return Vec4<T>(this->z, this->y, this->z, this->y);
	}

	constexpr Vec4<T> zyzz() const {
		return Vec4<T>(this->z, this->y, this->z, this->z);
	}

	constexpr Vec4<T> zzxx() const {
		return Vec4<T>(this->z, this->z, this->x, this->x);
	}

	constexpr Vec4<T> zzxy() const {
		return Vec4<T>(this->z, this->z, this->x, this->y);
	}

	constexpr Vec4<T> zzxz() const {
		return Vec4<T>(this->z, this->z, this->x, this->z);
	}

	constexpr Vec4<T> zzyx() const {
		return Vec4<T>(this->z, this->z, this->y, this->x);
	}

	constexpr Vec4<T> zzyy() const {
		return Vec4<T>(this->z, this->z, this->y, this->y);
	}

	constexpr Vec4<T> zzyz() const {
		return Vec4<T>(this->z, this->z, this->y, this->z);
	}

	constexpr Vec4<T> zzzx() const {
		return Vec4<T>(this->z, this->z, this->z, this->x);
	}

	constexpr Vec4<T> zzzy() const {
		return Vec4<T>(this->z, this->z, this->z, this->y);
	}

	constexpr Vec4<T> zzzz() const {
		return Vec4<T>(this->z, this->z, this->z, this->z);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Vec3<T>& vec) {
		os << "Vec3(" << vec.x << ", " << vec.y << ", " << vec.z << ")";
		return os;
	}

	static constexpr Vec3<T> X() {
		return Vec3<T>(T(1), T(0), T(0));
	}

	static constexpr Vec3<T> Y() {
		return Vec3<T>(T(0), T(1), T(0));
	}

	static constexpr Vec3<T> Z() {
		return Vec3<T>(T(0), T(0), T(1));
	}
};

template <class T>
constexpr T dot(const Vec3<T>& a, const Vec3<T>& b) {
	return a.dot(b);
}

template <class T>
constexpr Vec3<T> operator+(const T& a, const Vec3<T>& b) {
	return b + a;
}

template <class T>
constexpr Vec3<T> operator-(const T& a, const Vec3<T>& b) {
	return Vec3<T>(a) - b;
}

template <class T>
constexpr Vec3<T> operator*(const T& a, const Vec3<T>& b) {
	return b * a;
}

template <class T>
constexpr Vec3<T> operator/(const T& a, const Vec3<T>& b) {
	return Vec3<T>(a) / b;
}

} // namespace FixedPoint
