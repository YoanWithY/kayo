#pragma once
#include "../r3/R3Manager.hpp"
#include "webgpu/webgpu.h"
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
	R3Manager r3manager;
	std::map<std::string, WASMModule*> modules;

  public:
	WASMInstance();
	int32_t registerModule(WASMModule& module);
	const std::map<std::string, WASMModule*>& getModules() const;
};

} // namespace kayo