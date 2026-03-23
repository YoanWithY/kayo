#pragma once
#include "fixed.hpp"
#include "mat4_forward.hpp"
#include "vec2.hpp"
#include "vec3.hpp"
#include "vec4.hpp"
#include <cmath>
#include <string>

namespace FixedPoint {

/**
 * An effectively POD class that stores a 4x4 matrix in column major layout.
 */
template <class T>
class Mat4 {
  public:
	Vec4<T> v0;
	Vec4<T> v1;
	Vec4<T> v2;
	Vec4<T> v3;
	constexpr Mat4(const T& a) : v0(Vec4<T>(a, T(0), T(0), T(0))), v1(Vec4<T>(T(0), a, T(0), T(0))), v2(Vec4<T>(T(0), T(0), a, T(0))), v3(Vec4<T>(T(0), T(0), T(0), a)) {};
	constexpr Mat4(const Vec4<T>& a, const Vec4<T>& b, const Vec4<T>& c, const Vec4<T>& d) : v0(a), v1(b), v2(c), v3(d) {};
	template <class K>
	constexpr Mat4(const Mat4<K>& mat) : v0(Vec3<K>(mat.v0)), v1(Vec4<K>(mat.v1)), v2(Vec4<K>(mat.v2)), v3(Vec4<T>(mat.v3)){};

	constexpr const Vec3<T>& operator[](uint32_t n) const {
		switch (n) {
		case 0:
			return this->v0;
		case 1:
			return this->v1;
		case 2:
			return this->v2;
		case 3:
			return this->v3;
		default:
			throw std::range_error("Mat4 index out of range [0, 3]!");
		}
	}

	constexpr Vec4<T> row(uint32_t n) const {
		return Vec4<T>(this->v0[n], this->v1[n], this->v2[n], this->v3[n]);
	}

	constexpr Mat4<T> operator*(const T& v) const {
		return Mat4<T>(this->v0 * v, this->v1 * v, this->v2 * v, this->v3 * v);
	}

	constexpr Vec4<T> operator*(const Vec4<T>& v) const {
		return this->v0 * v.x + this->v1 * v.y + this->v2 * v.z + this->v3 * v.w;
	}

	constexpr Vec3<T> operator*(const Vec3<T>& v) const {
		return (*this * Vec4<T>(v, T(1))).xyz();
	}

	constexpr Mat4<T> operator*(const Mat4<T>& m) const {
		return Mat4<T>(
			Vec4<T>(this->row(0).dot(m[0]), this->row(1).dot(m[0]), this->row(2).dot(m[0]), this->row(3).dot(m[0])),
			Vec4<T>(this->row(0).dot(m[1]), this->row(1).dot(m[1]), this->row(2).dot(m[1]), this->row(3).dot(m[1])),
			Vec4<T>(this->row(0).dot(m[2]), this->row(1).dot(m[2]), this->row(2).dot(m[2]), this->row(3).dot(m[2])),
			Vec4<T>(this->row(0).dot(m[3]), this->row(1).dot(m[3]), this->row(2).dot(m[3]), this->row(3).dot(m[3])));
	}

	static constexpr Mat3<T> rotationX(const T& rad) {
		const T cos_ang = T(cos(rad));
		const T sin_ang = T(sin(rad));
		return Mat3<T>(Vec3<T>::X(), Vec3<T>(T(0), cos_ang, sin_ang), Vec3<T>(T(0), -sin_ang, cos_ang));
	}

	static constexpr Mat3<T> rotationY(const T& rad) {
		const T cos_ang = T(cos(rad));
		const T sin_ang = T(sin(rad));
		return Mat3<T>(Vec3<T>(cos_ang, T(0), -sin_ang), Vec3<T>::Y(), Vec3<T>(sin_ang, T(0), cos_ang));
	}

	static constexpr Mat3<T> rotationZ(const T& rad) {
		const T cos_ang = T(cos(rad));
		const T sin_ang = T(sin(rad));
		return Mat3<T>(Vec3<T>(cos_ang, sin_ang, T(0)), Vec3<T>(-sin_ang, cos_ang, T(0)), Vec3<T>::Z());
	}

	static constexpr Mat3<T> scaleXY(const T& x, const T& y) {
		return Mat3<T>(Vec3<T>(x, T(0), T(0)), Vec3<T>(T(0), y, T(0)), Vec3<T>(T(0), T(0), T(1)));
	}

	static constexpr Mat3<T> scaleXY(const Vec2<T>& scale) {
		return Mat3<T>::scaleXY(scale.x, scale.y);
	}

	static constexpr Mat3<T> scaleXYZ(const T& x, const T& y, const T& z) {
		return Mat3<T>(Vec3<T>(x, T(0), T(0)), Vec3<T>(T(0), y, T(0)), Vec3<T>(T(0), T(0), z));
	}

	static constexpr Mat3<T> scaleXYZ(const Vec3<T>& scale) {
		return Mat3<T>::scaleXYZ(scale.x, scale.y, scale.z);
	}

	static constexpr Mat3<T> translationXY(const T& x, const T& y) {
		return Mat3<T>(Vec3<T>(T(1), T(0), T(0)), Vec3<T>(T(0), T(1), T(0)), Vec3<T>(x, y, T(1)));
	}

	static constexpr Mat3<T> translationXY(const Vec2<T>& scale) {
		return Mat3<T>::translationXY(scale.x, scale.y);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Mat4<T>& mat) {
		os << "Mat4(" << mat.v0 << ", " << mat.v1 << ", " << mat.v2 << ", " << mat.v3 << ")";
		return os;
	}
};

template <class T>
constexpr Mat4<T> operator*(const T& scalar, const Mat4<T>& mat) {
	return mat * scalar;
}
} // namespace FixedPoint