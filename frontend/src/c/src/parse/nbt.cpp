#include "nbt.hpp"
#include "../parse/parse.hpp"
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

using namespace NBT;

ByteTag*
createByteTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	progress += 1;
	return new ByteTag(name, data[0]);
}

ShortTag* createShortTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	progress += 2;
	return new ShortTag(name, readU16AsBigEndian(data, 2));
}

IntTag* createIntTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	progress += 4;
	return new IntTag(name, readU32AsBigEndian(data, 4));
}

LongTag* createLongTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	progress += 8;
	return new LongTag(name, readI64AsBigEndian(data, 8));
}

FloatTag* createFloatTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	progress += 4;
	return new FloatTag(name, readAsFloat(data));
}

DoubleTag* createDoubleTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	progress += 8;
	return new DoubleTag(name, readAsFloat(data));
}

ByteArrayTag* createByteArrayTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	ByteArrayTag* tag = new ByteArrayTag(name);
	uint32_t size = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4 + size;
	tag->value.resize(size);
	std::copy(data, data + size, tag->value.begin());
	return tag;
}

StringTag* createStringTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	StringTag* tag = new StringTag(name);
	uint16_t size = readU16AsBigEndian(data, 2);
	data += 2;
	progress += 2 + size;
	tag->value.resize(size);
	std::copy(data, data + size, tag->value.begin());
	return tag;
}

CompoundTag* createCompoundTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	CompoundTag* tag = new CompoundTag(name);

	size_t nextProgress = 0;
	NBTBase* next = nullptr;
	do {
		next = parseNBT(data, nextProgress);
		data += nextProgress;
		progress += nextProgress;

		if (next->id > 0) {
			tag->value.push_back(next);
		}

	} while (next->id > 0);

	return tag;
}

IntArrayTag* createIntArrayTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	IntArrayTag* tag = new IntArrayTag(name);
	uint32_t size = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4 + size * 4;
	tag->value.resize(size);
	for (uint32_t i = 0; i < size; i++) {
		tag->value[i] = readI32AsBigEndian(data, 4);
		data += 4;
	}
	return tag;
}

LongArrayTag* createLongArrayTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;

	LongArrayTag* tag = new LongArrayTag(name);
	uint32_t size = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4 + size * 8;
	tag->value.resize(size);
	for (uint32_t i = 0; i < size; i++) {
		tag->value[i] = readI64AsBigEndian(data, 8);
		data += 8;
	}
	return tag;
}

ListTag* createListTag(const uint8_t* data, std::string name, size_t& progress) {
	progress = 0;
	ListTag* tag = new ListTag(name);

	uint8_t listID = data[0];
	data++;
	progress++;

	uint32_t listLength = readU32AsBigEndian(data, 4);
	data += 4;
	progress += 4;

	tag->value.resize(listLength);
	for (uint32_t i = 0; i < listLength; i++) {
		size_t nextProgress = 0;
		NBTBase* next;
		switch (listID) {
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
		default:
			std::cerr << "ID is no NBT" << std::endl;
			throw std::runtime_error("ID is no NBT.");
			break;
		}
		data += nextProgress;
		progress += nextProgress;
		tag->value[i] = next;
	}

	return tag;
}

NBTBase* NBT::parseNamedNBT(const uint8_t* data, size_t& progress) {
	progress = 0;

	uint8_t id = data[0];
	data++;
	progress++;

	uint16_t nameLength = readU32AsBigEndian(data, 2);
	data += 2;
	progress += 2;

	std::string name(reinterpret_cast<const char*>(data), nameLength);
	data += nameLength;
	progress += nameLength;

	size_t localProgress = 0;
	NBTBase* ret = nullptr;
	switch (id) {
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
	if (!ret) {
		std::cerr << "ID is no named NBT." << std::endl;
		throw std::runtime_error("ID is no named NBT.");
	}
	return ret;
}

NBTBase* NBT::parseNBT(const uint8_t* data, size_t& progress) {
	uint8_t id = data[0];
	if (id == 0) {
		progress = 1;
		return new EndTag();
	} else if (id > 12) {
		std::cerr << "ID is unknown." << std::endl;
		throw std::runtime_error("ID is unknown.");
	}
	return parseNamedNBT(data, progress);
}

// NBTBase member function
void NBTBase::display(std::ostream& os) const {
	os << "Base Tag";
}

NBTBase::NBTBase(const std::string& tagName)
	: name(tagName) {}

// Template class implementations
template <typename T>
NBT::GenericNBT<T>::GenericNBT(const std::string& tagName)
	: NBTBase(tagName) {}

template <typename T>
NBT::GenericNBT<T>::GenericNBT(const std::string& tagName, const T& tagContent)
	: NBTBase(tagName), value(tagContent) {}

template <typename T>
void NBT::GenericNBT<T>::display(std::ostream& os) const {
	os << "\"" << this->name << "\": ";
	this->displayContent(os);
}

NBTContainer::NBTContainer(const std::string& tagName)
	: GenericNBT<std::vector<NBTBase*>>(tagName) {}

// EndTag class implementation
EndTag::EndTag()
	: NBTBase("End Tag") {
	id = 0;
}

void EndTag::display(std::ostream& os) const {
	os << "End Tag";
}

void EndTag::displayContent(std::ostream&) const {
}

// ByteTag class implementation
ByteTag::ByteTag(const std::string& name, int8_t value)
	: GenericNBT(name, value) {
	id = 1;
}

std::string ByteTag::getTypeName() const {
	return "byte";
}

void ByteTag::displayContent(std::ostream& os) const {
	os << int(value);
}

// ShortTag class implementation
ShortTag::ShortTag(const std::string& name, int16_t value)
	: GenericNBT(name, value) {
	id = 2;
}

std::string ShortTag::getTypeName() const {
	return "short";
}

void ShortTag::displayContent(std::ostream& os) const {
	os << value;
}

// IntTag class implementation
IntTag::IntTag(const std::string& name, int32_t value)
	: GenericNBT(name, value) {
	id = 3;
}

std::string IntTag::getTypeName() const {
	return "int";
}

void IntTag::displayContent(std::ostream& os) const {
	os << value;
}

// LongTag class implementation
LongTag::LongTag(const std::string& name, int64_t value)
	: GenericNBT(name, value) {
	id = 4;
}

std::string LongTag::getTypeName() const {
	return "long";
}

void LongTag::displayContent(std::ostream& os) const {
	os << value;
}

// FloatTag class implementation
FloatTag::FloatTag(const std::string& name, float value)
	: GenericNBT(name, value) {
	id = 5;
}

std::string FloatTag::getTypeName() const {
	return "float";
}

void FloatTag::displayContent(std::ostream& os) const {
	os << value;
}

// DoubleTag class implementation
DoubleTag::DoubleTag(const std::string& name, double value)
	: GenericNBT(name, value) {
	id = 6;
}

std::string DoubleTag::getTypeName() const {
	return "double";
}

void DoubleTag::displayContent(std::ostream& os) const {
	os << value;
}

// ByteArrayTag class implementation
ByteArrayTag::ByteArrayTag(const std::string& name)
	: GenericNBT(name) {
	id = 7;
}

std::string ByteArrayTag::getTypeName() const {
	return "byte[]";
}

void ByteArrayTag::displayContent(std::ostream& os) const {
	os << "[\n";
	for (int8_t value : this->value)
		os << static_cast<int>(value) << ", ";
	os << "]";
}

// StringTag class implementation
StringTag::StringTag(const std::string& name)
	: GenericNBT(name) {
	id = 8;
}

std::string StringTag::getTypeName() const {
	return "String";
}

void StringTag::displayContent(std::ostream& os) const {
	os << "\"" << value << "\"";
}

// ListTag class implementation
ListTag::ListTag(const std::string& name)
	: NBTContainer(name) {
	id = 9;
}

std::string ListTag::getTypeName() const {
	return "List";
}

void ListTag::displayContent(std::ostream& os) const {
	if (this->value.empty()) {
		os << "[]";
		return;
	}
	os << "[";
	size_t i = 0;
	size_t max = this->value.size() - 1;
	for (NBTBase* nbt : this->value) {
		nbt->displayContent(os);
		if (i++ < max)
			os << ",";
	}
	os << "]";
}

// CompoundTag class implementation
CompoundTag::CompoundTag(const std::string& name)
	: NBTContainer(name) {
	id = 10;
}

std::string CompoundTag::getTypeName() const {
	return "Compound";
}

void CompoundTag::displayContent(std::ostream& os) const {
	if (this->value.empty()) {
		os << "{}";
		return;
	}
	os << "\n{\n";
	size_t i = 0;
	size_t max = this->value.size() - 1;
	for (NBTBase* nbt : this->value) {
		nbt->display(os);
		if (i++ < max)
			os << ",\n";
	}
	os << "\n}";
}

// IntArrayTag class implementation
IntArrayTag::IntArrayTag(const std::string& name)
	: GenericNBT(name) {
	id = 11;
}

std::string IntArrayTag::getTypeName() const {
	return "int[]";
}

void IntArrayTag::displayContent(std::ostream& os) const {
	if (this->value.empty()) {
		os << "[]";
		return;
	}
	os << "[";
	size_t i = 0;
	size_t max = this->value.size() - 1;
	for (int32_t value : this->value) {
		os << value << ", ";
		if (i++ < max)
			os << ", ";
	}
	os << "]";
}

// LongArrayTag class implementation
LongArrayTag::LongArrayTag(const std::string& name)
	: GenericNBT(name) {
	id = 12;
}

std::string LongArrayTag::getTypeName() const {
	return "long[]";
}

void LongArrayTag::displayContent(std::ostream& os) const {
	if (this->value.empty()) {
		os << "[]";
		return;
	}
	os << "[";
	size_t i = 0;
	size_t max = this->value.size() - 1;
	for (int64_t value : this->value) {
		os << value;
		if (i++ < max)
			os << ", ";
	}
	os << "]";
}