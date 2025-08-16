#pragma once
#include <cstdint>
#include <iomanip>
#include <sstream>
#include <string>

#define FIXED_POINT_DECIMAL_BITS 32
#define FIXED_POINT_INTEGER_BITS 63
#define FIXED_POINT_DECIMAL_FACTOR (uint64_t(1) << FIXED_POINT_DECIMAL_BITS)
#define FIXED_POINT_DECIMAL_MASK ((FIXED_POINT_DECIMAL_FACTOR) - 1)

namespace FixedPoint {

typedef std::array<uint64_t, 2> NumberWire;

constexpr __int128_t max_Q_rep = (__int128_t(1) << (FIXED_POINT_DECIMAL_BITS + FIXED_POINT_INTEGER_BITS)) - __int128_t(1);
constexpr __int128_t min_Q_rep = -max_Q_rep;

constexpr __int128_t saturate(const __int128_t& a) {
	return (a > max_Q_rep) ? max_Q_rep : (a < min_Q_rep ? min_Q_rep : a);
}
constexpr double pi = 3.14159265358979323846;

/**
 * A Q63.32 signed fixed point number.
 * @note The implementation relies on the GCC `__int128_t`.
 */
class Number {
  private:
	__int128_t n;

  public:
	// ----- CONSTRUCTORS ----- //

	constexpr Number() : n(0) {}
	constexpr Number(__int128_t n) : n{saturate(n)} {}
	constexpr Number(int8_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(int16_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(int32_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(int64_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint8_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint16_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint32_t a) : n(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR) {}
	constexpr Number(uint64_t a) : n(saturate(static_cast<__int128_t>(a) * FIXED_POINT_DECIMAL_FACTOR)) {}

	constexpr Number(float a) : n((a < 0 ? -1 : 1) * saturate(
														 (static_cast<__int128_t>(std::abs(a)) * FIXED_POINT_DECIMAL_FACTOR) |
														 (static_cast<__int128_t>((std::abs(a) - static_cast<float>(static_cast<__int128_t>(std::abs(a)))) * float(FIXED_POINT_DECIMAL_FACTOR))))) {
	}

	constexpr Number(double a) : n((a < 0 ? -1 : 1) * saturate(
														  (static_cast<__int128_t>(std::abs(a)) * FIXED_POINT_DECIMAL_FACTOR) |
														  (static_cast<__int128_t>((std::abs(a) - static_cast<double>(static_cast<__int128_t>(std::abs(a)))) * double(FIXED_POINT_DECIMAL_FACTOR))))) {}
	inline Number(NumberWire a) {
		std::memcpy(&this->n, a.data(), sizeof(this->n));
	}

	/**
	 * Must be of format `-?d+\.d+`
	 */
	Number(const std::string& value);

	static NumberWire fromDoubleJS(double d);
	static double toDoubleJS(NumberWire d);
	static std::string toStringJS(NumberWire d);
	static NumberWire nremap(double x, double start_x, double end_x, NumberWire start_new, NumberWire end_new);
	static double remapn(NumberWire x, NumberWire start_x, NumberWire end_x, double start_new, double end_new);
	static NumberWire mulJS(NumberWire a, NumberWire b);
	static NumberWire nmulJS(double a, NumberWire b);
	static NumberWire mulnJS(NumberWire a, double b);
	static NumberWire addJS(NumberWire a, NumberWire b);
	static NumberWire naddJS(double a, NumberWire b);
	static NumberWire addnJS(NumberWire a, double b);
	static NumberWire subJS(NumberWire a, NumberWire b);
	static NumberWire nsubJS(double a, NumberWire b);
	static NumberWire subnJS(NumberWire a, double b);
	static NumberWire divJS(NumberWire a, NumberWire b);
	static NumberWire ndivJS(double a, NumberWire b);
	static NumberWire divnJS(NumberWire a, double b);
	static NumberWire floorJS(NumberWire a);
	static NumberWire ceilJS(NumberWire a);
	static NumberWire modJS(NumberWire a, NumberWire b);
	static double modnJS(NumberWire a, double b);
	static NumberWire nmodJS(double a, NumberWire b);
	friend std::ostream& operator<<(std::ostream& os, const Number& number);
	std::string toString() const;

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

	inline explicit operator NumberWire() const {
		NumberWire result;
		std::memcpy(result.data(), static_cast<const void*>(&this->n), sizeof(this->n));
		return result;
	}

	// ----- MATH ----- //

	constexpr int32_t sign() const {
		return (*this == 0) ? 0 : (*this < 0 ? -1 : 1);
	}

	constexpr int32_t sign2() const {
		return (*this) < 0 ? -1 : 1;
	}

	constexpr Number floor() const {
		int64_t i = static_cast<int64_t>(*this);
		return (*this < 0 && *this != i) ? i - 1 : i;
	}

	constexpr Number ceil() const {
		int64_t i = static_cast<int64_t>(*this);
		return (*this >= 0 && *this != i) ? i + 1 : i;
	}

	constexpr double fract() const {
		return static_cast<double>(*this - this->floor());
	}

	constexpr int64_t integer() const {
		return static_cast<int64_t>(this->floor());
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
		return Number(this->n * -1);
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

	// ----- MATH ----- //

	constexpr Number mod(const Number& b) const {
		return *this - (b * (*this / b).floor());
	}

	constexpr double sin() const {
		return std::sin(static_cast<double>(this->mod(2.0 * pi)));
	}

	constexpr double cos() const {
		return std::cos(static_cast<double>(this->mod(2.0 * pi)));
	}

	constexpr double tan() const {
		return std::tan(static_cast<double>(this->mod(pi)));
	}
};

constexpr Number MAX_NUMBER(max_Q_rep);
constexpr Number MIN_NUMBER(min_Q_rep);

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

constexpr Number floor(const Number& number) {
	return number.floor();
}

constexpr Number ceil(const Number& number) {
	return number.ceil();
}

constexpr Number mod(const Number& a, const Number& b) {
	return a - (floor(a / b) * b);
}

template <class T>
constexpr double sin(const T& number) {
	return std::sin(number);
}

template <class T>
constexpr double cos(const T& number) {
	return std::cos(number);
}

template <class T>
constexpr double tan(const T& number) {
	return std::tan(number);
}

template <>
constexpr double sin(const Number& number) {
	return number.sin();
}

template <>
constexpr double cos(const Number& number) {
	return number.cos();
}

template <>
constexpr double tan(const Number& number) {
	return number.tan();
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

constexpr Number operator+(const float& first, const Number& second) {
	return Number(first) + second;
}

constexpr Number operator+(const double& first, const Number& second) {
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

constexpr Number operator-(const float& first, const Number& second) {
	return Number(first) - second;
}

constexpr Number operator-(const double& first, const Number& second) {
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

constexpr Number operator*(const float& first, const Number& second) {
	return Number(first) * second;
}

constexpr Number operator*(const double& first, const Number& second) {
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

constexpr Number operator/(const float& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number operator/(const double& first, const Number& second) {
	return Number(first) / second;
}

constexpr Number min(const Number& a, const Number& b) {
	return a <= b ? a : b;
}

constexpr Number max(const Number& a, const Number& b) {
	return a >= b ? a : b;
}

} // namespace FixedPoint