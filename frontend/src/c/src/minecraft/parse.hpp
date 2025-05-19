#pragma once
#include <cstdint>
#include <vector>
#define CHAR_TO_U32(c) (static_cast<uint32_t>(static_cast<unsigned char>(c)))
#define CHAR_TO_U64(c) (static_cast<uint64_t>(static_cast<unsigned char>(c)))
#define CHAR_TO_I32(c) (static_cast<uint32_t>(c))
#define U8_TO_U32(c) (static_cast<int32_t>(c))
#define CHAR_TO_U8(c) (static_cast<uint8_t>(c))

void printNext(const uint8_t* data, uint8_t num);

uint16_t readU16AsBigEndian(const uint8_t* data, uint8_t num);

uint32_t readU32AsBigEndian(const uint8_t* data, uint8_t num);

int16_t readI16AsBigEndian(const uint8_t* data, uint8_t num);

int32_t readI32AsBigEndian(const uint8_t* data, uint8_t num);

int64_t readI64AsBigEndian(const uint8_t* data, uint8_t num);

float readAsFloat(const uint8_t* data);

double readAsDouble(const uint8_t* data);

int modulus(int a, int b);

std::vector<std::string> splitByDot(const std::string& str);

uint16_t extractIndex(int64_t data, uint8_t shift, uint64_t mask);