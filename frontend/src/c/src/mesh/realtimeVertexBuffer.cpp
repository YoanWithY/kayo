#include "../numerics/vec3.hpp"
#include "realtimeVertexBuffers.hpp"
#include <emscripten/bind.h>

namespace kayo {
namespace mesh {
memUtils::KayoPointer VertexBuffer::dataJS() const {
	return {reinterpret_cast<uintptr_t>(data), bytes_total};
}
void VertexBuffer::updateBytes() {
	bytes_per_vertex = 0;
	for (const auto& attrib : attributes)
		bytes_per_vertex += attrib.bytes;
	bytes_total = bytes_per_vertex * num_vertices;
}
void VertexBuffer::clear() {
	std::free(data);
	attributes.clear();
	num_vertices = 0;
	updateBytes();
	data = nullptr;
}
RealtimeData::RealtimeData(kayo::mesh::Mesh* mesh) : mesh(mesh) {
	build();
}
void RealtimeData::build() {
	position.clear();
	uvs.clear();
	tangent_space.clear();

	uint32_t num_vertices = 0;
	for (const auto& face : mesh->getFaces())
		num_vertices += face->triangulation.size();
	uint32_t i = 0;

	position.num_vertices = num_vertices;
	position.attributes.emplace_back(VertexAttribute{"float32x3", 0, 0, sizeof(FixedPoint::vec3f)});
	position.updateBytes();
	position.stepMode = "vertex";
	position.arrayStride = sizeof(FixedPoint::vec3f);
	position.data = std::malloc(position.bytes_total);
	FixedPoint::vec3f* pos = static_cast<FixedPoint::vec3f*>(position.data);
	for (const auto& face : mesh->getFaces()) {
		for (uint32_t face_vertex_index : face->triangulation) {
			pos[i++] = face->edges[face_vertex_index]->in->shared_vertex->position;
		}
	}
	i = 0;

	tangent_space.num_vertices = num_vertices;
	tangent_space.attributes.emplace_back(VertexAttribute{"float32x3", 0, 1, sizeof(FixedPoint::vec3f)});
	tangent_space.updateBytes();
	tangent_space.stepMode = "vertex";
	tangent_space.arrayStride = sizeof(FixedPoint::vec3f);
	tangent_space.data = std::malloc(tangent_space.bytes_total);
	FixedPoint::vec3f* norm = static_cast<FixedPoint::vec3f*>(tangent_space.data);
	for (const auto& face : mesh->getFaces()) {
		for (uint32_t face_vertex_index : face->triangulation) {
			norm[i++] = face->edges[face_vertex_index]->in->normal;
		}
	}

	if (mesh->uv_maps.size() > 0) {
		uvs.num_vertices = num_vertices;
		uvs.attributes.emplace_back(VertexAttribute{"float32x2", 0, 2, 1 * sizeof(FixedPoint::vec2f)});
		uvs.updateBytes();
		uvs.stepMode = "vertex";
		uvs.arrayStride = 1 * sizeof(FixedPoint::vec2f);
		uvs.data = std::malloc(uvs.bytes_total);

		FixedPoint::vec2f* uv = static_cast<FixedPoint::vec2f*>(uvs.data);
		for (const auto& face : mesh->getFaces()) {
			for (uint32_t face_vertex_index : face->triangulation) {
				FixedPoint::vec2f p = *(face->edges[face_vertex_index]->in->uvs[0]);
				uv[i].x = p.x;
				uv[i].y = p.y;
			}
		}
		i = 0;
	}
}
} // namespace mesh
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoMeshRealtimeBindings) {
	value_object<kayo::mesh::VertexAttribute>("VertexAttribute")
		.field("format", &kayo::mesh::VertexAttribute::format)
		.field("offset", &kayo::mesh::VertexAttribute::offset)
		.field("shaderLocation", &kayo::mesh::VertexAttribute::shaderLocation);
	register_vector<kayo::mesh::VertexAttribute>("VectorVertexAttribute");
	class_<kayo::mesh::VertexBuffer>("VertexBuffer")
		.property("arrayStride", &kayo::mesh::VertexBuffer::arrayStride)
		.property("stepMode", &kayo::mesh::VertexBuffer::stepMode)
		.property("attributes", &kayo::mesh::VertexBuffer::attributes)
		.property("numVertices", &kayo::mesh::VertexBuffer::num_vertices)
		.property("data", &kayo::mesh::VertexBuffer::dataJS)
		.property("bytesTotal", &kayo::mesh::VertexBuffer::bytes_total);
	class_<kayo::mesh::RealtimeData>("RealtimeData")
		.constructor<kayo::mesh::Mesh*>()
		.function("build", &kayo::mesh::RealtimeData::build)
		.property("position", &kayo::mesh::RealtimeData::position, return_value_policy::reference())
		.property("uvs", &kayo::mesh::RealtimeData::uvs, return_value_policy::reference())
		.property("tangentSpace", &kayo::mesh::RealtimeData::tangent_space, return_value_policy::reference());
}