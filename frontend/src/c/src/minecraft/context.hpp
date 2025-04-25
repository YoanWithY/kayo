#pragma once
#include <emscripten/bind.h>

namespace minecraft {
int setActiveChunk(std::string world, int dimension, int chunkX, int chunkZ);
int buildChunk(std::string world, int dimension, int chunkX, int chunkZ);
std::string getPalette(int8_t y);
emscripten::val getSectionView(std::string world, int dimension, int sectionX, int8_t sectionY, int sectionZ);
int8_t getByte(std::string name);
int16_t getShort(std::string name);
int32_t getInt(std::string name);
int64_t getLong(std::string name);
float getFloat(std::string name);
double getDouble(std::string name);
emscripten::val getByteArray(std::string name);
std::string getString(std::string name);
std::string getList(std::string name);
std::string getCompound(std::string name);
void openRegion(std::string world, int dimension, int x, int y, std::string file);
} // namespace minecraft