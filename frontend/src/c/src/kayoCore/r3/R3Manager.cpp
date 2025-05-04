#include "R3Manager.hpp"
#include "../utils/memUtils.hpp"
#include <cstdint>
#include <vector>

/**
 * A (singelton) class that manages the ressources for all objects that shall be rendered.
 * This includes transformation matrices and bounding spheres.
 */
using namespace FixedPoint;

int64_t R3Manager::allocIndex() {
	int64_t ret = this->indexBlocks[0].end + 1;
	if (this->indexBlocks.size() > 1 && this->indexBlocks[1].start == ret) {
		this->indexBlocks[0].end = this->indexBlocks[1].end;
		this->indexBlocks.erase(this->indexBlocks.begin() + 1);
	} else {
		this->indexBlocks[0].end++;
	}
	return ret;
};

int64_t R3Manager::alloc() {
	int64_t i = this->allocIndex();
	if (i < 0)
		return i;

	if (i == this->transformations.size()) {
		this->transformations.emplace_back(mat4f(1.0f));
		this->boundingSpheres.emplace_back(vec4f(0.0f));
	}
	return i;
}

void R3Manager::set(uint64_t id, const mat4f& transformation, const vec4f& boundingSphere) {
	this->transformations[id] = transformation;
	this->boundingSpheres[id] = boundingSphere;
}

void R3Manager::free(uint64_t id) {
	for (uint64_t i = 0; i < this->indexBlocks.size(); i++) {
		IndexBlock& indexBlock = this->indexBlocks[i];
		if (!(id >= uint64_t(indexBlock.start) && id <= uint64_t(indexBlock.end)))
			continue;

		if (indexBlock.start == indexBlock.end) {
			this->indexBlocks.erase(this->indexBlocks.begin() + i);
			return;
		}

		if (id == uint64_t(indexBlock.start)) {
			indexBlock.start++;
			return;
		}

		if (id == uint64_t(indexBlock.end)) {
			indexBlock.end--;
			return;
		}

		this->indexBlocks.insert(this->indexBlocks.begin() + i, IndexBlock{int64_t(id + 1), indexBlock.end});
		indexBlock.end = id - 1;
		return;
	}
}

emscripten::val R3Manager::getTransformationsView() const {
	return emscripten::val(emscripten::typed_memory_view(this->transformations.size() * sizeof(mat4f), reinterpret_cast<const float*>(this->transformations.data())));
}
