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

std::string Number::toString() const {
	std::ostringstream oss;
	oss << *this;
	return oss.str();
}

NumberJSWireType Number::fromDoubleJS(double d) {
	const Number x = d;
	return static_cast<NumberJSWireType>(x);
}

double Number::toDoubleJS(NumberJSWireType d) {
	return static_cast<double>(Number(d));
}

std::string Number::toStringJS(NumberJSWireType d) {
	return Number(d).toString();
}

NumberJSWireType Number::mulJS(NumberJSWireType a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) * Number(b));
}
NumberJSWireType Number::nmulJS(double a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) * Number(b));
}
NumberJSWireType Number::mulnJS(NumberJSWireType a, double b) {
	return static_cast<NumberJSWireType>(Number(a) * Number(b));
}
NumberJSWireType Number::addJS(NumberJSWireType a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) + Number(b));
}
NumberJSWireType Number::naddJS(double a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) + Number(b));
}
NumberJSWireType Number::addnJS(NumberJSWireType a, double b) {
	return static_cast<NumberJSWireType>(Number(a) + Number(b));
}
NumberJSWireType Number::subJS(NumberJSWireType a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) - Number(b));
}
NumberJSWireType Number::nsubJS(double a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) - Number(b));
}
NumberJSWireType Number::subnJS(NumberJSWireType a, double b) {
	return static_cast<NumberJSWireType>(Number(a) - Number(b));
}
NumberJSWireType Number::divJS(NumberJSWireType a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) / Number(b));
}
NumberJSWireType Number::ndivJS(double a, NumberJSWireType b) {
	return static_cast<NumberJSWireType>(Number(a) / Number(b));
}
NumberJSWireType Number::divnJS(NumberJSWireType a, double b) {
	return static_cast<NumberJSWireType>(Number(a) / Number(b));
}

NumberJSWireType Number::nremap(double x, double start_x, double end_x, NumberJSWireType start_new, NumberJSWireType end_new) {
	Number s = Number(start_new);
	return static_cast<NumberJSWireType>(Number(x - start_x / (end_x - start_x)) * (Number(end_new) - s) + s);
}

double Number::remapn(NumberJSWireType x, NumberJSWireType start_x, NumberJSWireType end_x, double start_new, double end_new) {
	Number s = Number(start_x);
	return double(Number(x) - s / (Number(end_x) - s)) * (end_new - start_new) + start_new;
}

} // namespace FixedPoint

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoFixedWASM) {
	value_array<FixedPoint::NumberJSWireType>("KayoNumber")
		.element(emscripten::index<0>())
		.element(emscripten::index<1>());
	class_<FixedPoint::Number>("KN")
		.class_function("fromDouble", &FixedPoint::Number::fromDoubleJS)
		.class_function("toDouble", &FixedPoint::Number::toDoubleJS)
		.class_function("toString", &FixedPoint::Number::toStringJS)
		.class_function("nremap", &FixedPoint::Number::nremap)
		.class_function("remapn", &FixedPoint::Number::remapn)
		.class_function("add", &FixedPoint::Number::addJS)
		.class_function("nadd", &FixedPoint::Number::naddJS)
		.class_function("addn", &FixedPoint::Number::addnJS)
		.class_function("mul", &FixedPoint::Number::mulJS)
		.class_function("nmul", &FixedPoint::Number::nmulJS)
		.class_function("muln", &FixedPoint::Number::mulnJS)
		.class_function("sub", &FixedPoint::Number::subJS)
		.class_function("nsub", &FixedPoint::Number::nsubJS)
		.class_function("subn", &FixedPoint::Number::subnJS)
		.class_function("div", &FixedPoint::Number::divJS)
		.class_function("ndiv", &FixedPoint::Number::ndivJS)
		.class_function("divn", &FixedPoint::Number::divnJS);
}