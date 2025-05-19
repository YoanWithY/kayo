#include "../../numerics/fixedMath.hpp"
#include "../utils/memUtils.hpp"
#include <cstdint>
#include <emscripten/bind.h>
#include <vector>

/**
 * A (singelton) class that manages the ressources for all objects that shall be rendered.
 * This includes transformation matrices and bounding spheres.
 */
using namespace FixedPoint;
class R3Manager {
  private:
	std::vector<mat4f> transformations;
	std::vector<vec4f> boundingSpheres;
	std::vector<IndexBlock> indexBlocks;

	int64_t allocIndex();

  public:
	int64_t alloc();
	void set(int32_t id, const mat4f& transformation, const vec4f& boundingSphere);
	void free(int32_t id);
	emscripten::val getTransformationsView() const;
};
