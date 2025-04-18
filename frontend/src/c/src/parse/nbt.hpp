#pragma once
#include "parse.hpp"
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace NBT {
class NBTBase {
  public:
	std::string name;
	int8_t id = -1;

	NBTBase(const std::string& tagName = "Base Element");

	template <typename T>
	T* as() {
		return reinterpret_cast<T*>(this);
	}

	virtual void display(std::ostream& os) const;
	virtual void displayContent(std::ostream& os) const = 0;
	virtual ~NBTBase() = default; // Virtual destructor
};

template <typename T>
class GenericNBT : public NBTBase {
  public:
	T value;

	GenericNBT(const std::string& tagName);
	GenericNBT(const std::string& tagName, const T& tagContent);

	virtual std::string getTypeName() const = 0;

	void display(std::ostream& os) const override;
};

class NBTContainer : public GenericNBT<std::vector<NBTBase*>> {
  public:
	NBTContainer(const std::string& tagName);

	virtual std::string getTypeName() const = 0;
	virtual void displayContent(std::ostream& os) const = 0;

	template <typename T>
	T* getTag(const std::string& entry) const;
};

template <typename T>
T* NBTContainer::getTag(const std::string& entry) const {
	for (auto it : this->value) {
		if (it->name == entry)
			return dynamic_cast<T*>(it);
	}
	return nullptr;
}

class EndTag : public NBTBase {
  public:
	EndTag();
	void display(std::ostream& os) const override;
	void displayContent(std::ostream& os) const override;
};

class ByteTag : public GenericNBT<int8_t> {
  public:
	ByteTag(const std::string& name, int8_t value);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class ShortTag : public GenericNBT<int16_t> {
  public:
	ShortTag(const std::string& name, int16_t value);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class IntTag : public GenericNBT<int32_t> {
  public:
	IntTag(const std::string& name, int32_t value);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class LongTag : public GenericNBT<int64_t> {
  public:
	LongTag(const std::string& name, int64_t value);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class FloatTag : public GenericNBT<float> {
  public:
	FloatTag(const std::string& name, float value);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class DoubleTag : public GenericNBT<double> {
  public:
	DoubleTag(const std::string& name, double value);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class ByteArrayTag : public GenericNBT<std::vector<int8_t>> {
  public:
	ByteArrayTag(const std::string& name);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class StringTag : public GenericNBT<std::string> {
  public:
	StringTag(const std::string& name);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class ListTag : public NBTContainer {
  public:
	ListTag(const std::string& name);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class CompoundTag : public NBTContainer {
  public:
	CompoundTag(const std::string& name);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class IntArrayTag : public GenericNBT<std::vector<int32_t>> {
  public:
	IntArrayTag(const std::string& name);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

class LongArrayTag : public GenericNBT<std::vector<int64_t>> {
  public:
	LongArrayTag(const std::string& name);
	std::string getTypeName() const override;
	void displayContent(std::ostream& os) const override;
};

// Forward declaration of the parse functions
NBTBase* parseNamedNBT(const uint8_t* data, size_t& progress);
NBTBase* parseNBT(const uint8_t* data, size_t& progress);

template <typename T>
T* getTag(const NBTContainer* active, const std::string& name) {
	if (!active)
		throw std::runtime_error("Active is NULL.");
	auto selector = splitByDot(name);
	int selectorBound = selector.size() - 1;
	for (auto i = 0; i < selectorBound; i++) {
		active = active->getTag<NBTContainer>(selector[i]);
	}
	return active->getTag<T>(selector[selectorBound]);
}

template <typename T, typename N>
T getGeneric(const NBTContainer* active, const std::string& name) {
	return getTag<N>(active, name)->value;
}

} // namespace NBT