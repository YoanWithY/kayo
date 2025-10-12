#pragma once
#include "../../numerics/fixedMath.hpp"
#include "../../utils/memUtils.hpp"
namespace kayo {
class Projection {
  protected:
	FixedPoint::mat4f matrix;
	FixedPoint::Number near;
	FixedPoint::Number far;
	uint32_t width_px;
	uint32_t height_px;

  public:
	virtual ~Projection() = default;
	kayo::memUtils::KayoPointer getProjectionMatrixJS();
	void setNearJS(FixedPoint::NumberWire near);
	FixedPoint::NumberWire getNearJS();
	void setFarJS(FixedPoint::NumberWire far);
	FixedPoint::NumberWire getFarJS();
	uint32_t getWidthJS() const;
	void setWidthJS(uint32_t w);
	uint32_t getHeightJS() const;
	void setHeightJS(uint32_t h);
	virtual void updateMatrix() = 0;
};

class PerspectiveProjection : public Projection {
  private:
	FixedPoint::Number vFOV;

  public:
	void setvFOVJS(FixedPoint::NumberWire vFOV);
	FixedPoint::NumberWire getvFOVJS();
	void updateMatrix() override;
};
} // namespace kayo