#pragma once
#include <cstdint>
#include <sstream>
#include <string>

#define FIXED_POINT_DECIMAL_BITS 32
#define FIXED_POINT_INTEGER_BITS 63
#define FIXED_POINT_DECIMAL_FACTOR (uint64_t(1) << FIXED_POINT_DECIMAL_BITS)
#define FIXED_POINT_DECIMAL_MASK ((FIXED_POINT_DECIMAL_FACTOR) - 1)

namespace FixedPoint {

inline constexpr __int128_t max_Q_rep = (__int128_t(1) << (FIXED_POINT_DECIMAL_BITS + FIXED_POINT_INTEGER_BITS)) - __int128_t(1);
inline constexpr __int128_t min_Q_rep = -max_Q_rep;

constexpr __int128_t saturate(const __int128_t& a) {
	return (a > max_Q_rep) ? max_Q_rep : (a < min_Q_rep ? min_Q_rep : a);
}

/**
 * A Q63.32 signed fixed point number.
 * @note The implementation relies on the GCC `__int128_t`.
 */
class Number {
  public:
	__int128_t n;

	// ----- CONSTRUCTORS ----- //

	constexpr Number(__int128_t n) : n{saturate(n)} {}

	constexpr Number(int8_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(int16_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(int32_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(int64_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint8_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint16_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint32_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint64_t a) : n(saturate(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR)) {}

	inline Number(float a) : n(0) {
		int32_t i = static_cast<int>(a);
		float f = a - static_cast<float>(i);
		this->n = saturate(
			(static_cast<__int128_t>(i) * FIXED_POINT_DECIMAL_FACTOR) |
			static_cast<__int128_t>(f * float(FIXED_POINT_DECIMAL_FACTOR)));
	}

	inline Number(double a) {
		int32_t i = static_cast<int>(a);
		double f = a - static_cast<float>(i);
		this->n = saturate(
			(static_cast<__int128_t>(i) * FIXED_POINT_DECIMAL_FACTOR) |
			static_cast<__int128_t>(f * double(FIXED_POINT_DECIMAL_FACTOR)));
	}

	// ----- COMPARISON ----- //

	constexpr bool operator==(const Number& other) const {
		return this->n == other.n;
	}

	constexpr bool operator!=(const Number& other) const {
		return this->n != other.n;
	}

	constexpr bool operator<(const Number& other) const {
		return this->n < other.n;
	}

	constexpr bool operator<=(const Number& other) const {
		return this->n <= other.n;
	}

	constexpr bool operator>=(const Number& other) const {
		return this->n >= other.n;
	}

	constexpr bool operator>(const Number& other) const {
		return this->n > other.n;
	}

	// ----- CAST ----- //

	constexpr explicit operator int8_t() const {
		return int8_t(this->n / __int128_t(FIXED_POINT_DECIMAL_FACTOR));
	}

	constexpr explicit operator int16_t() const {
		return int16_t(this->n / __int128_t(FIXED_POINT_DECIMAL_FACTOR));
	}

	constexpr explicit operator int32_t() const {
		return int32_t(this->n / __int128_t(FIXED_POINT_DECIMAL_FACTOR));
	}

	constexpr explicit operator int64_t() const {
		return int64_t(this->n / __int128_t(FIXED_POINT_DECIMAL_FACTOR));
	}

	constexpr explicit operator float() const {
		return float(this->n) / float(FIXED_POINT_DECIMAL_FACTOR);
	}

	constexpr explicit operator double() const {
		return double(this->n) / double(FIXED_POINT_DECIMAL_FACTOR);
	}

	std::string toString() const;

	// ----- MATH ----- //

	constexpr int32_t sign() const {
		return (*this == 0) ? 0 : (*this < 0 ? -1 : 1);
	}

	constexpr int32_t sign2() const {
		return (*this) < 0 ? -1 : 1;
	}

	constexpr double fract() const {
		double d = (this->n & FIXED_POINT_DECIMAL_MASK) / double(FIXED_POINT_DECIMAL_FACTOR);
		return (this->sign2() == 1) ? d : 1.0 - d;
	}

	constexpr int64_t integer() const {
		return static_cast<int64_t>(*this);
	}

	constexpr Number abs() const {
		return Number(this->n >= 0 ? this->n : -this->n);
	}

	// ----- ADDITION ----- //

	constexpr Number operator+(const Number& other) const {
		return Number(this->n + other.n);
	}

	constexpr Number& operator+=(const Number& other) {
		this->n += other.n;
		return *this;
	}

	// ----- SUBTRACTION ----- //

	constexpr Number operator-(const Number& other) const {
		return Number(this->n - other.n);
	}

	constexpr Number& operator-=(const Number& other) {
		this->n -= other.n;
		return *this;
	}

	constexpr Number operator-() const {
		return *this * -1;
	}

	// ----- MULTIPLICATION ----- //

	constexpr Number operator*(const Number& other) const {
		return Number((this->n * other.n) / FIXED_POINT_DECIMAL_FACTOR);
	}

	// ----- DIVISION ----- //

	constexpr Number operator/(const Number& other) const {
		if (other == 0)
			return Number(max_Q_rep) * other.sign2();
		return Number((this->n * __int128_t(FIXED_POINT_DECIMAL_FACTOR)) / other.n);
	}
};

// ----- MATH ----- //

constexpr int32_t sign(const Number& number) {
	return number.sign();
}

constexpr int32_t sign2(const Number& number) {
	return number.sign2();
}

constexpr double fract(const Number& number) {
	return number.fract();
}

constexpr int64_t integer(const Number& number) {
	return number.integer();
}

constexpr Number abs(const Number& number) {
	return number.abs();
}

// ----- ADDITION ----- //

constexpr Number operator+(const int8_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const int16_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const int32_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const int64_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const uint8_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const uint16_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const uint32_t& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const uint64_t& first, const Number& second) {
	return Number(first) + second;
}

inline Number operator+(const float& first, const Number& second) {
	return Number(first) + second;
}

inline Number operator+(const double& first, const Number& second) {
	return Number(first) + second;
}

// ----- SUBTRACTION ----- //

constexpr Number operator-(const int8_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const int16_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const int32_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const int64_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const uint8_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const uint16_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const uint32_t& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const uint64_t& first, const Number& second) {
	return Number(first) - second;
}

inline Number operator-(const float& first, const Number& second) {
	return Number(first) - second;
}

inline Number operator-(const double& first, const Number& second) {
	return Number(first) - second;
}

// ----- MULTIPLICATION ----- //

constexpr Number operator*(const int8_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const int16_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const int32_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const int64_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const uint8_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const uint16_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const uint32_t& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const uint64_t& first, const Number& second) {
	return Number(first) * second;
}

inline Number operator*(const float& first, const Number& second) {
	return Number(first) * second;
}

inline Number operator*(const double& first, const Number& second) {
	return Number(first) * second;
}

// ----- DIVISION ----- //

constexpr Number operator/(const int8_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const int16_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const int32_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const int64_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const uint8_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const uint16_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const uint32_t& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const uint64_t& first, const Number& second) {
	return Number(first) / second;
}

inline Number operator/(const float& first, const Number& second) {
	return Number(first) / second;
}

inline Number operator/(const double& first, const Number& second) {
	return Number(first) / second;
}

} // namespace FixedPoint