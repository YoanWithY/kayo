#pragma once
#include "mat2_forward.hpp"
#include "vec2.hpp"
#include <cmath>
#include <string>

namespace FixedPoint {
template <class T>
class Mat2 {
  public:
	Vec2<T> v0;
	Vec2<T> v1;
	constexpr Mat2(const T& a) : v0(Vec2<T>(a, T(0))), v1(Vec2<T>(T(0), a)) {};
	constexpr Mat2(const Vec2<T>& a, const Vec2<T>& b) : v0(a), v1(b) {};
	template <class K>
	constexpr Mat2(const Mat2<K>& mat) : v0(Vec2<K>(mat.v0)), v1(Vec2<K>(mat.v1)){};

	constexpr const Vec2<T>& operator[](uint32_t n) const {
		return reinterpret_cast<const Vec2<T>*>(this)[n];
	}

	constexpr Vec2<T> row(uint32_t n) const {
		return Vec2<T>(this->v0[n], this->v1[n]);
	}

	constexpr Mat2<T> operator*(const T& v) const {
		return Mat2<T>(this->v0 * v, this->v1 * v);
	}

	constexpr Vec2<T> operator*(const Vec2<T>& v) const {
		return this->v0 * v.x + this->v1 * v.y;
	}

	constexpr Mat2<T> operator*(const Mat2<T>& m) const {
		return Mat2<T>(
			Vec2<T>(this->row(0).dot(m[0]), this->row(1).dot(m[0])),
			Vec2<T>(this->row(0).dot(m[1]), this->row(1).dot(m[1])));
	}

	static constexpr Mat2<T> rotationZ(const T& rad) {
		Vec2<T> x = Vec2<T>(cos(rad), sin(rad));
		return Mat2<T>(x, x.positveNormal());
	}

	static constexpr Mat2<T> scaleX(const T& x) {
		return Mat2<T>(Vec2<T>(x, 0), Vec2<T>(0, 1));
	}

	static constexpr Mat2<T> scaleY(const T& y) {
		return Mat2<T>(Vec2<T>(1, 0), Vec2<T>(0, y));
	}

	static constexpr Mat2<T> scaleXY(const T& x, const T& y) {
		return Mat2<T>(Vec2<T>(x, 0), Vec2<T>(0, y));
	}

	static constexpr Mat2<T> scaleXY(const Vec2<T>& scale) {
		return Mat2<T>::scaleXY(scale.x, scale.y);
	}

	inline friend std::ostream& operator<<(std::ostream& os, const Mat2<T>& mat) {
		os << "Mat2(" << mat.v0 << ", " << mat.v1 << ")";
		return os;
	}
};

template <class T>
constexpr Mat2<T> operator*(const T& scalar, const Mat2<T>& mat) {
	return mat * scalar;
}
} // namespace FixedPoint