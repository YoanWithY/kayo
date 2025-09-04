#pragma once
#include "../../numerics/fixedMath.hpp"
#include "../core/jsViewControlled.hpp"
#include "../core/vector.hpp"

namespace kayo {

class R3Object {
  private:
	R3Object* parent;

  public:
	const int64_t ressource_id;
	Vector3<FixedPoint::Number> position;
	R3Object(int64_t ressource_id, const FixedPoint::vec3& position);

	R3Object* getParent();
};
} // namespace kayo