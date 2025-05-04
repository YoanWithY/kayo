#pragma once
#include <cstdint>
#include <iostream>
#include <map>
#include <string>

namespace kayo {

class WASMModule;
class WASMInstance;

class WASMModule {
  private:
	[[maybe_unused]] WASMInstance const& instance;

  public:
	const std::string name;
	inline WASMModule(WASMInstance& instance) : instance(instance) {};
	virtual int32_t pre_registration() = 0;
	virtual int32_t post_registration() = 0;
	inline virtual ~WASMModule() {};
};

class WASMInstance {
	std::map<std::string, WASMModule*> modules;

  public:
	inline WASMInstance() {
		std::cout << "Hello from the Kayo C++ WASM instance." << std::endl;
	};
	inline int32_t registerModule(WASMModule& module) {
		if (this->modules.contains(module.name))
			return 1;

		module.pre_registration();
		this->modules.insert({module.name, &module});
		module.post_registration();
		return 0;
	}
	inline const std::map<std::string, WASMModule*>& getModules() const {
		return this->modules;
	}
};

} // namespace kayo