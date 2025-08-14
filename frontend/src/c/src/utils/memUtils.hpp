#pragma once
#include <cstdint>

namespace kayo {
namespace memUtils {

struct IndexBlock {
	int32_t start;
	int32_t end;
};

struct KayoPointer {
	uintptr_t byteOffset;
	uint32_t byteLength;
};

template <typename T>
inline KayoPointer allocKayoArray(uint32_t num_elements) {
	return KayoPointer(reinterpret_cast<uintptr_t>(new T[num_elements]), num_elements * sizeof(T));
}

} // namespace memUtils
} // namespace kayo