#include <cstdint>
#include <iostream>
#include "parse.hpp"

void printNext(const uint8_t *data, uint8_t num)
{
	for (uint8_t i = 0; i < num; i++)
	{
		std::cout << CHAR_TO_U32(data[i]) << " ";
	}
	std::cout << std::endl;
}

uint16_t readU16AsBigEndian(const uint8_t *data, uint8_t num)
{
	uint16_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++)
	{
		res |= CHAR_TO_U32(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

uint32_t readU32AsBigEndian(const uint8_t *data, uint8_t num)
{
	uint32_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++)
	{
		res |= CHAR_TO_U32(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

uint64_t readU64AsBigEndian(const uint8_t *data, uint8_t num)
{
	uint64_t res = 0;
	uint8_t maxShift = num - 1;
	for (uint8_t i = 0; i < num; i++)
	{
		res |= CHAR_TO_U64(data[i]) << ((maxShift - i) * 8);
	}
	return res;
}

float readAsFloat(const uint8_t *data)
{
	return (reinterpret_cast<const float *>(data))[0];
}

double readAsDouble(const uint8_t *data)
{
	return (reinterpret_cast<const double *>(data))[0];
}