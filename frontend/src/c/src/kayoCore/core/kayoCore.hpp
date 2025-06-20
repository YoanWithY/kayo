#pragma once
#include "../r3/R3Manager.hpp"
#include "project.hpp"
#include "renderConfig.hpp"
#include "renderState.hpp"
#include "webgpu/webgpu.h"
#include <cstdint>
#include <iostream>
#include <map>
#include <string>

namespace kayo {

class KayoModule;
class KayoInstance;

class KayoModule {
  private:
	[[maybe_unused]] KayoInstance const& instance;

  public:
	const std::string name;
	inline KayoModule(KayoInstance& instance) : instance(instance) {};
	virtual int32_t pre_registration() = 0;
	virtual int32_t post_registration() = 0;
	inline virtual ~KayoModule() {};
};

class KayoInstance {
	R3Manager r3manager;
	std::map<std::string, KayoModule*>
		modules;

  public:
	KayoInstance();
	Project project;
	int32_t registerModule(KayoModule& module);
	const std::map<std::string, KayoModule*>& getModules() const;
};

} // namespace kayo