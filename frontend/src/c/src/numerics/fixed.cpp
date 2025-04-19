#include "fixed.hpp"
#include <cstdint>
#include <iomanip>
#include <iostream>

using namespace FixedPoint;

std::string Number::toString() const {
	std::ostringstream oss;
	double f = this->fract();
	oss << std::setprecision(FIXED_POINT_DECIMAL_BITS) << f;
	std::string frac = std::floor(f) == f ? "0" : oss.str().substr(2);
	oss = std::ostringstream();
	oss << this->integer() << "." << frac;
	return oss.str();
}
