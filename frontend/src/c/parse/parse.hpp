#pragma once
#define CHAR_TO_U32(c) (static_cast<uint32_t>(static_cast<unsigned char>(c)))
#define CHAR_TO_U64(c) (static_cast<uint64_t>(static_cast<unsigned char>(c)))
#define CHAR_TO_I32(c) (static_cast<uint32_t>(c))
#define U8_TO_U32(c) (static_cast<int32_t>(c))
#define CHAR_TO_U8(c) (static_cast<uint8_t>(c))

void printNext(const uint8_t *data, uint8_t num);

uint16_t readU16AsBigEndian(const uint8_t *data, uint8_t num);

uint32_t readU32AsBigEndian(const uint8_t *data, uint8_t num);

uint64_t readU64AsBigEndian(const uint8_t *data, uint8_t num);

float readAsFloat(const uint8_t *data);

double readAsDouble(const uint8_t *data);