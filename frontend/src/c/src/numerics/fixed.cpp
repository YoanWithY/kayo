#include "fixed.hpp"

#include <emscripten/bind.h>
#include <iostream>

namespace FixedPoint {
std::ostream& operator<<(std::ostream& os, const Number& number) {
	std::ostringstream oss;
	Number a = number.abs();
	double f = a.fract();
	oss << std::setprecision(FIXED_POINT_DECIMAL_BITS) << f;
	std::string frac = std::floor(f) == f ? "0" : oss.str().substr(2);
	oss = std::ostringstream();
	oss << (number < 0 ? "-" : "") << a.integer() << "." << frac;
	os << oss.str();
	return os;
}

Number::Number(const std::string& value) {
	size_t pos = value.find('.');

	if (pos == std::string::npos)
		std::cerr << "No dot found in the string." << std::endl;

	std::string int_str = value.substr(0, pos);
	std::string digit_str = value.substr(pos);
	Number int_part = std::strtoll(int_str.c_str(), nullptr, int(int_str.length()));
	Number digit_part = std::strtoll(digit_str.c_str(), nullptr, int(digit_str.length()));
	this->n = int_part < 0 ? (int_part - digit_part).n : (int_part + digit_part).n;
}

Number::Number(const void* ptr, size_t) : n(reinterpret_cast<const __int128_t*>(ptr)[0]) {}

std::string Number::toString() const {
	std::ostringstream oss;
	oss << *this;
	return oss.str();
}

std::string Number::fromDouble(double d) {
	const Number x = d;
	return std::string(reinterpret_cast<const char*>(&x.n), sizeof(x.n));
}

std::string Number::fromBytes(std::string d) {
	const Number x = d;
	return std::string(reinterpret_cast<const char*>(&x.n), sizeof(x.n));
}

double Number::toDouble(std::string d) {
	return double(Number(reinterpret_cast<const void*>(d.c_str()), d.length()));
}

std::string Number::toString(std::string d) {
	return Number(reinterpret_cast<const void*>(d.c_str()), d.length()).toString();
}

Number::operator std::string() const {
	return std::string(reinterpret_cast<const char*>(&this->n), sizeof(this->n));
}

} // namespace FixedPoint

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoFixedWASM) {
	class_<FixedPoint::Number>("KayoNumber")
		.class_function("fromDouble", &FixedPoint::Number::fromDouble)
		.class_function("fromBytes", &FixedPoint::Number::fromBytes)
		.class_function("toDouble", &FixedPoint::Number::toDouble)
		.class_function("toString", &FixedPoint::Number::toString);
}