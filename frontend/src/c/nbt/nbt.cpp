#include <string>
#include <iostream>
#include <vector>
#include <cstdlib>
#include "../parse/parse.hpp"
#include "nbt.hpp"

ByteTag *createByteTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	progress += 1;
	return new ByteTag(name, data[0]);
}

ShortTag *createShortTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	progress += 2;
	return new ShortTag(name, readU16AsBigEndian(data, 2));
}

IntTag *createIntTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	progress += 4;
	return new IntTag(name, readU32AsBigEndian(data, 4));
}

LongTag *createLongTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	progress += 8;
	return new LongTag(name, readU64AsBigEndian(data, 8));
}

FloatTag *createFloatTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	progress += 4;
	return new FloatTag(name, readAsFloat(data));
}

DoubleTag *createDoubleTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	progress += 8;
	return new DoubleTag(name, readAsFloat(data));
}

ByteArrayTag *createByteArrayTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	ByteArrayTag *tag = new ByteArrayTag(name);
	uint32_t size = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4 + size;
	tag->value.resize(size);
	std::copy(data, data + size, tag->value.begin());
	return tag;
}

StringTag *createStringTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	StringTag *tag = new StringTag(name);
	uint16_t size = readU16AsBigEndian(data, 2);
	data += 2;
	progress += 2 + size;
	tag->value.resize(size);
	std::copy(data, data + size, tag->value.begin());
	return tag;
}

CompoundTag *createCompoundTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	CompoundTag *tag = new CompoundTag(name);

	size_t nextProgress = 0;
	NBTBase *next = parseNBT(data, nextProgress);
	data += nextProgress;
	progress += nextProgress;
	while (next->id > 0)
	{
		tag->value.push_back(next);
		next = parseNBT(data, nextProgress);
		data += nextProgress;
		progress += nextProgress;
	}
	return tag;
}

IntArrayTag *createIntArrayTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	IntArrayTag *tag = new IntArrayTag(name);
	uint32_t size = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4 + size * 4;
	tag->value.resize(size);
	std::copy(data, data + size * 4, tag->value.begin());
	return tag;
}

LongArrayTag *createLongArrayTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	LongArrayTag *tag = new LongArrayTag(name);
	uint32_t size = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4 + size * 8;
	tag->value.resize(size);
	std::copy(data, data + size * 8, tag->value.begin());
	return tag;
}

ListTag *createListTag(const uint8_t *data, std::string name, size_t &progress)
{
	progress = 0;
	ListTag *tag = new ListTag(name);

	uint8_t listID = data[0];
	data++;
	progress++;

	uint32_t listLength = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4;

	tag->value.resize(listLength);
	for (uint32_t i = 0; i < listLength; i++)
	{
		size_t nextProgress = 0;
		NBTBase *next;
		switch (listID)
		{
		case 1:
			next = createByteTag(data, std::to_string(i), nextProgress);
			break;
		case 2:
			next = createShortTag(data, std::to_string(i), nextProgress);
			break;
		case 3:
			next = createIntTag(data, std::to_string(i), nextProgress);
			break;
		case 4:
			next = createLongTag(data, std::to_string(i), nextProgress);
			break;
		case 5:
			next = createFloatTag(data, std::to_string(i), nextProgress);
			break;
		case 6:
			next = createDoubleTag(data, std::to_string(i), nextProgress);
			break;
		case 7:
			next = createByteArrayTag(data, std::to_string(i), nextProgress);
			break;
		case 8:
			next = createStringTag(data, std::to_string(i), nextProgress);
			break;
		case 9:
			next = createListTag(data, std::to_string(i), nextProgress);
			break;
		case 10:
			next = createCompoundTag(data, std::to_string(i), nextProgress);
			break;
		case 11:
			next = createIntArrayTag(data, std::to_string(i), nextProgress);
			break;
		case 12:
			next = createLongArrayTag(data, std::to_string(i), nextProgress);
			break;
		}

		data += nextProgress;
		progress += nextProgress;
		tag->value[i] = next;
	}

	return tag;
}

NBTBase *parseNamedNBT(const uint8_t *data, size_t &progress)
{
	progress = 0;
	uint8_t id = data[0];
	data++;

	uint16_t nameLength = readU32AsBigEndian(data, 2);
	data += 2;

	std::string name(reinterpret_cast<const char *>(data), nameLength);
	data += nameLength;

	progress = 3 + nameLength;

	size_t localProgress = 0;
	NBTBase *ret = nullptr;
	switch (id)
	{
	case 1:
		ret = createByteTag(data, name, localProgress);
		break;
	case 2:
		ret = createShortTag(data, name, localProgress);
		break;
	case 3:
		ret = createIntTag(data, name, localProgress);
		break;
	case 4:
		ret = createLongTag(data, name, localProgress);
		break;
	case 5:
		ret = createFloatTag(data, name, localProgress);
		break;
	case 6:
		ret = createDoubleTag(data, name, localProgress);
		break;
	case 7:
		ret = createByteArrayTag(data, name, localProgress);
		break;
	case 8:
		ret = createStringTag(data, name, localProgress);
		break;
	case 9:
		ret = createListTag(data, name, localProgress);
		break;
	case 10:
		ret = createCompoundTag(data, name, localProgress);
		break;
	case 11:
		ret = createIntArrayTag(data, name, localProgress);
		break;
	case 12:
		ret = createLongArrayTag(data, name, localProgress);
		break;
	}

	progress += localProgress;
	if (!ret)
		return new NBTBase();
	return ret;
}

NBTBase *parseNBT(const uint8_t *data, size_t &progress)
{
	uint8_t id = data[0];
	if (id == 0)
	{
		progress = 1;
		return new EndTag();
	}
	else if (id > 12)
	{
		progress = 1;
		return new NBTBase();
	}
	return parseNamedNBT(data, progress);
}