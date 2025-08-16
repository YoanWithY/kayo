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

NumberWire Number::fromDoubleJS(double d) {
	const Number x = d;
	return static_cast<NumberWire>(x);
}

double Number::toDoubleJS(NumberWire d) {
	return static_cast<double>(Number(d));
}

std::string Number::toStringJS(NumberWire d) {
	return Number(d).toString();
}

NumberWire Number::mulJS(NumberWire a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) * Number(b));
}
NumberWire Number::nmulJS(double a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) * Number(b));
}
NumberWire Number::mulnJS(NumberWire a, double b) {
	return static_cast<NumberWire>(Number(a) * Number(b));
}
NumberWire Number::addJS(NumberWire a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) + Number(b));
}
NumberWire Number::naddJS(double a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) + Number(b));
}
NumberWire Number::addnJS(NumberWire a, double b) {
	return static_cast<NumberWire>(Number(a) + Number(b));
}
NumberWire Number::subJS(NumberWire a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) - Number(b));
}
NumberWire Number::nsubJS(double a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) - Number(b));
}
NumberWire Number::subnJS(NumberWire a, double b) {
	return static_cast<NumberWire>(Number(a) - Number(b));
}
NumberWire Number::divJS(NumberWire a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) / Number(b));
}
NumberWire Number::ndivJS(double a, NumberWire b) {
	return static_cast<NumberWire>(Number(a) / Number(b));
}
NumberWire Number::divnJS(NumberWire a, double b) {
	return static_cast<NumberWire>(Number(a) / Number(b));
}

NumberWire Number::nremap(double x, double start_x, double end_x, NumberWire start_new, NumberWire end_new) {
	Number s = Number(start_new);
	return static_cast<NumberWire>((Number((x - start_x) / (end_x - start_x)) * (Number(end_new) - s)) + s);
}

double Number::remapn(NumberWire x, NumberWire start_x, NumberWire end_x, double start_new, double end_new) {
	Number s = Number(start_x);
	return double((Number(x) - s) / (Number(end_x) - s)) * (end_new - start_new) + start_new;
}

NumberWire Number::floorJS(NumberWire a) {
	return static_cast<NumberWire>(Number(a).floor());
}

NumberWire Number::ceilJS(NumberWire a) {
	return static_cast<NumberWire>(Number(a).ceil());
}

NumberWire Number::modJS(NumberWire a, NumberWire b) {
	return static_cast<NumberWire>(Number(a).mod(Number(b)));
}

double Number::modnJS(NumberWire a, double b) {
	return static_cast<double>(Number(a).mod(Number(b)));
}

NumberWire Number::nmodJS(double a, NumberWire b) {
	return static_cast<NumberWire>(Number(a).mod(Number(b)));
}

} // namespace FixedPoint

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoFixedWASM) {
	value_array<FixedPoint::NumberWire>("KayoNumber")
		.element(emscripten::index<0>())
		.element(emscripten::index<1>());
	class_<FixedPoint::Number>("KN")
		.class_function("fromDouble", &FixedPoint::Number::fromDoubleJS)
		.class_function("toDouble", &FixedPoint::Number::toDoubleJS)
		.class_function("toString", &FixedPoint::Number::toStringJS)
		.class_function("nremap", &FixedPoint::Number::nremap)
		.class_function("remapn", &FixedPoint::Number::remapn)
		.class_function("floor", &FixedPoint::Number::floorJS)
		.class_function("ceil", &FixedPoint::Number::ceilJS)
		.class_function("mod", &FixedPoint::Number::modJS)
		.class_function("modn", &FixedPoint::Number::modnJS)
		.class_function("nmod", &FixedPoint::Number::nmodJS)
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