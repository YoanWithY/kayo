#pragma once
#include "../utils/memUtils.hpp"
#include "./mesh.hpp"
#include <string>
#include <vector>

namespace kayo {
namespace mesh {
struct VertexAttribute {
	std::string format;
	uint32_t offset;
	uint32_t shaderLocation;
	uint32_t bytes;
};
class VertexBuffer {
  public:
	std::string stepMode;
	uint32_t arrayStride = 0;
	void* data = nullptr;
	uint32_t num_vertices = 0;
	uint32_t bytes_per_vertex = 0;
	uint32_t bytes_total = 0;
	std::vector<VertexAttribute> attributes;
	kayo::memUtils::KayoPointer dataJS() const;
	void updateBytes();
	void clear();
};
class RealtimeData {
  public:
	kayo::mesh::Mesh* mesh;
	RealtimeData(kayo::mesh::Mesh* mesh);
	void build();
	/**
	 * Object space vertex position
	 */
	VertexBuffer position;
	/**
	 * *(uv)
	 */
	VertexBuffer uvs;
	/**
	 * Object space Normal, *(Tangant, Bitangent)
	 */
	VertexBuffer tangent_space;
};
} // namespace mesh
} // namespace kayo