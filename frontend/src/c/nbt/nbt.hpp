#pragma once
#include <string>
#include <iostream>
#include <vector>
#include <cstdlib>
#include "../parse/parse.hpp"

class NBTBase
{
public:
	int8_t id = -1;

	template <typename T>
	T *as()
	{
		return reinterpret_cast<T *>(this);
	}

	virtual void display()
	{
		std::cout << "Base Tag";
	}
};

template <typename T>
class NBT : public NBTBase
{
public:
	std::string name;
	T value;

	NBT(const std::string &tagName)
		: name(tagName) {}

	NBT(const std::string &tagName, const T &tagContent)
		: name(tagName), value(tagContent) {}

	virtual void displayContent() = 0;
	virtual std::string getTypeName() = 0;

	void display() override
	{
		std::cout << this->getTypeName() << " " << this->name << ": ";
		this->displayContent();
	}

	// Virtual destructor
	virtual ~NBT() = default;
};

class EndTag : public NBTBase
{
public:
	EndTag()
	{
		id = 0;
	}
	void display() override
	{
		std::cout << "End Tag";
	}
};

class ByteTag : public NBT<int8_t>
{
public:
	ByteTag(const std::string &name, int8_t value)
		: NBT(name, value)
	{
		id = 1;
	}
	std::string getTypeName() override
	{
		return "byte";
	};
	void displayContent() override
	{
		std::cout << CHAR_TO_I32(value);
	};
};

class ShortTag : public NBT<int16_t>
{
public:
	ShortTag(const std::string &name, int16_t value)
		: NBT(name, value)
	{
		id = 2;
	}
	std::string getTypeName() override
	{
		return "short";
	};
	void displayContent() override
	{
		std::cout << value;
	};
};

class IntTag : public NBT<int32_t>
{
public:
	IntTag(const std::string &name, int32_t value)
		: NBT(name, value)
	{
		id = 3;
	}
	std::string getTypeName() override
	{
		return "int";
	};
	void displayContent() override
	{
		std::cout << value;
	};
};

class LongTag : public NBT<int64_t>
{
public:
	LongTag(const std::string &name, int64_t value)
		: NBT(name, value)
	{
		id = 3;
	}
	std::string getTypeName() override
	{
		return "long";
	};

	void displayContent() override
	{
		std::cout << value;
	};
};

class FloatTag : public NBT<float>
{
public:
	FloatTag(const std::string &name, float value)
		: NBT(name, value)
	{
		id = 5;
	}

	std::string getTypeName() override
	{
		return "float";
	};
	void displayContent() override
	{
		std::cout << value;
	};
};

class DoubleTag : public NBT<double>
{
public:
	DoubleTag(const std::string &name, double value)
		: NBT(name, value)
	{
		id = 6;
	}

	std::string getTypeName() override
	{
		return "double";
	};
	void displayContent() override
	{
		std::cout << value;
	};
};

class ByteArrayTag : public NBT<std::vector<int8_t>>
{
public:
	ByteArrayTag(const std::string &name)
		: NBT(name)
	{
		id = 7;
	}

	std::string getTypeName() override
	{
		return "byte[]";
	};
	void displayContent() override
	{
		std::cout << "[\n";
		for (int8_t value : this->value)
			std::cout << static_cast<int>(value) << ", ";
		std::cout << "]";
	};
};

class StringTag : public NBT<std::string>
{
public:
	StringTag(const std::string &name)
		: NBT(name)
	{
		id = 8;
	}

	std::string getTypeName() override
	{
		return "String";
	};
	void displayContent() override
	{
		std::cout << value;
	};
};

class ListTag : public NBT<std::vector<NBTBase *>>
{
public:
	ListTag(const std::string &name)
		: NBT<std::vector<NBTBase *>>(name)
	{
		id = 9;
	}

	std::string getTypeName() override
	{
		return "List";
	};
	void displayContent() override
	{
		if (this->value.size() == 0)
		{
			std::cout << "[]";
			return;
		}
		std::cout << "[\n";
		for (NBTBase *nbt : this->value)
		{
			nbt->display();
			std::cout << ",\n";
		}
		std::cout << "]";
	};
};

class CompoundTag : public NBT<std::vector<NBTBase *>>
{
public:
	CompoundTag(const std::string &name)
		: NBT(name)
	{
		id = 10;
	}

	template <typename T>
	T *getTag(uint32_t i)
	{
		return dynamic_cast<T *>(value[i]);
	}

	std::string getTypeName() override
	{
		return "Compound";
	};
	void displayContent() override
	{
		if (this->value.size() == 0)
		{
			std::cout << "{}";
			return;
		}
		std::cout << "{\n";
		for (NBTBase *nbt : this->value)
		{
			nbt->display();
			std::cout << ";\n";
		}
		std::cout << "}";
	};
};

class IntArrayTag : public NBT<std::vector<int32_t>>
{
public:
	IntArrayTag(const std::string &name)
		: NBT(name)
	{
		id = 11;
	}
	std::string getTypeName() override
	{
		return "int[]";
	};
	void displayContent() override
	{
		std::cout << "[";
		for (int32_t value : this->value)
			std::cout << value << ", ";
		std::cout << "]";
	};
};

class LongArrayTag : public NBT<std::vector<int64_t>>
{
public:
	LongArrayTag(const std::string &name)
		: NBT(name)
	{
		id = 12;
	}
	std::string getTypeName() override
	{
		return "long[]";
	};
	void displayContent() override
	{
		std::cout << "[";
		for (int64_t value : this->value)
			std::cout << value << ", ";
		std::cout << "]";
	};
};

NBTBase *parseNamedNBT(const uint8_t *data, size_t &progress);
NBTBase *parseNBT(const uint8_t *data, size_t &progress);