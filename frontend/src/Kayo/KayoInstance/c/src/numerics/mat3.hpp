#pragma once
#include "fixed.hpp"
#include "mat3_forward.hpp"
#include "vec2.hpp"
#include "vec3.hpp"
#include <cmath>
#include <string>

namespace FixedPoint {

/**
 * An effectively POD class that stores a 2x2 matrix in column major layout.
 */
template <class T>
class Mat3 {
  public:
	Vec3<T> v0;
	Vec3<T> v1;
	Vec3<T> v2;
	constexpr Mat3(const T& a) : v0(Vec3<T>(a, T(0), T(0))), v1(Vec3<T>(T(0), a, T(0))), v2(Vec3<T>(T(0), T(0), a)) {};
	constexpr Mat3(const Vec3<T>& a, const Vec3<T>& b, const Vec3<T>& c) : v0(a), v1(b), v2(c) {};
	template <class K>
	constexpr Mat3(const Mat3<K>& mat) : v0(Vec3<K>(mat.v0)), v1(Vec3<K>(mat.v1)), v2(Vec3<K>(mat.v2)){};

	constexpr const Vec3<T>& operator[](uint32_t n) const {
		switch (n) {
		case 0:
			return this->v0;
		case 1:
			return this->v1;
		case 2:
			return this->v2;
		default:
			throw std::range_error("Mat3 index out of range [0, 2]!");
		}
	}

	constexpr Vec3<T> row(uint32_t n) const {
		return Vec3<T>(this->v0[n], this->v1[n], this->v2[n]);
	}

	constexpr Mat3<T> operator*(const T& v) const {
		return Mat3<T>(this->v0 * v, this->v1 * v, this->v2 * v);
	}

	constexpr Vec3<T> operator*(const Vec3<T>& v) const {
		return this->v0 * v.x + this->v1 * v.y + this->v2 * v.z;
	}

	constexpr Vec2<T> operator*(const Vec2<T>& v) const {
		return (*this * Vec3<T>(v, T(1))).xy();
	}

	constexpr Mat3<T> operator*(const Mat3<T>& m) const {
		return Mat3<T>(
			Vec3<T>(this->row(0).dot(m[0]), this->row(1).dot(m[0]), this->row(2).dot(m[0])),
			Vec3<T>(this->row(0).dot(m[1]), this->row(1).dot(m[1]), this->row(2).dot(m[1])),
			Vec3<T>(this->row(0).dot(m[2]), this->row(1).dot(m[2]), this->row(2).dot(m[2])));
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

	inline friend std::ostream& operator<<(std::ostream& os, const Mat3<T>& mat) {
		os << "Mat3(" << mat.v0 << ", " << mat.v1 << ", " << mat.v2 << ")";
		return os;
	}
};

template <class T>
constexpr Mat3<T> operator*(const T& scalar, const Mat3<T>& mat) {
	return mat * scalar;
}
} // namespace FixedPoint