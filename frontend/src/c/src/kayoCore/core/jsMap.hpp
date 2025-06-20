#pragma once
#include <concepts>
#include <map>
#include <string>

namespace kayo {
template <typename T>
class JsMap {
  private:
	std::map<std::string, T*> map;

  public:
	T* get(const std::string& key) {
		if (this->map.contains(key))
			return this->map[key];
		return nullptr;
	}

	void set(const std::string& key, T* value) {
		this->map[key] = value;
	}

	void remove(const std::string& key) {
		this->map.erase(key);
	}
};
} // namespace kayo