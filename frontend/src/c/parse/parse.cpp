#include "parse.hpp"
#include <cstdint>
#include <iostream>
#include <sstream>
#include <vector>

void printNext(const uint8_t* data, uint8_t num) {
	for (uint8_t i = 0; i < num; i++) {
		std::cout << CHAR_TO_U32(data[i]) << " ";
	}
	std::cout << std::endl;
}

uint16_t readU16AsBigEndian(const uint8_t* data, uint8_t num) {
	uint16_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++) {
		res |= CHAR_TO_U32(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

uint32_t readU32AsBigEndian(const uint8_t* data, uint8_t num) {
	uint32_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++) {
		res |= CHAR_TO_U32(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

int32_t readI32AsBigEndian(const uint8_t* data, uint8_t num) {
	int32_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++) {
		res |= CHAR_TO_U32(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

int64_t readI64AsBigEndian(const uint8_t* data, uint8_t num) {
	int64_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++) {
		res |= CHAR_TO_U64(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

float readAsFloat(const uint8_t* data) {
	return (reinterpret_cast<const float*>(data))[0];
}

double readAsDouble(const uint8_t* data) {
	return (reinterpret_cast<const double*>(data))[0];
}

int modulus(int a, int b) {
	// Ensure that b is positive
	if (b <= 0) {
		throw std::invalid_argument("Divisor must be positive");
	}
	// Calculate the modulus
	return (a % b + b) % b; // Ensures a non-negative result
}

std::vector<std::string> splitByDot(const std::string& str) {
	std::vector<std::string> result;
	std::stringstream ss(str);
	std::string token;
	while (std::getline(ss, token, '.')) {
		result.push_back(token);
	}
	return result;
}

uint16_t extractIndex(int64_t data, uint8_t shift, uint64_t mask) {
	return static_cast<uint16_t>((data >> shift) & mask);
}