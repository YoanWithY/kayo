#include "mesh.hpp"
#include <algorithm>
#include <emscripten/bind.h>

namespace kayo {
namespace mesh {

bool Mesh::addSharedVertex(SharedVertex* sv) {
	if (!sv)
		return false;
	auto it = std::find(shared_vertices.begin(), shared_vertices.end(), sv);
	if (it != shared_vertices.end())
		return false;
	shared_vertices.push_back(sv);
	return true;
}

bool Mesh::addSharedEdge(SharedEdge* e) {
	if (!e)
		return false;
	auto it = std::find(shared_edges.begin(), shared_edges.end(), e);
	if (it != shared_edges.end())
		return false;
	shared_edges.push_back(e);
	return true;
}

bool Mesh::addFace(Face* f) {
	if (!f)
		return false;
	auto it = std::find(faces.begin(), faces.end(), f);
	if (it != faces.end())
		return false;
	faces.push_back(f);
	return true;
}

uint32_t Mesh::ensureVertexAttribute(const std::string& attrib_name) {
	auto it = vertex_attributes.find(attrib_name);
	if (it != vertex_attributes.end())
		return it->second;
	uint32_t idx = static_cast<uint32_t>(vertex_attributes.size());
	vertex_attributes.emplace(attrib_name, idx);
	return idx;
}

uint32_t Mesh::ensureEdgeAttribute(const std::string& attrib_name) {
	auto it = edge_attributes.find(attrib_name);
	if (it != edge_attributes.end())
		return it->second;
	uint32_t idx = static_cast<uint32_t>(edge_attributes.size());
	edge_attributes.emplace(attrib_name, idx);
	return idx;
}

uint32_t Mesh::ensureFaceAttribute(const std::string& attrib_name) {
	auto it = face_attributes.find(attrib_name);
	if (it != face_attributes.end())
		return it->second;
	uint32_t idx = static_cast<uint32_t>(face_attributes.size());
	face_attributes.emplace(attrib_name, idx);
	return idx;
}

SharedEdge* Mesh::connectSharedVertices(SharedVertex* a, SharedVertex* b) {
	if (!a || !b || a == b)
		return nullptr;

	for (SharedEdge* e : a->shared_edges)
		if (e->other(a) == b)
			return e;

	SharedEdge* edge = new SharedEdge();
	edge->v1 = a;
	edge->v2 = b;
	a->shared_edges.push_back(edge);
	b->shared_edges.push_back(edge);
	addSharedEdge(edge);
	return edge;
}

const std::vector<SharedVertex*>& Mesh::getSharedVertices() const {
	return shared_vertices;
}
const std::vector<std::string>& Mesh::getMaterials() const {
	return materials;
}

const std::vector<SharedEdge*>& Mesh::getSharedEdges() const {
	return shared_edges;
}
const std::vector<Face*>& Mesh::getFaces() const {
	return faces;
}

uint32_t Mesh::addMaterial(const std::string& material_name) {
	auto it = std::find(materials.begin(), materials.end(), material_name);
	if (it != materials.end())
		return static_cast<uint32_t>(std::distance(materials.begin(), it));
	materials.push_back(material_name);
	return static_cast<uint32_t>(materials.size() - 1);
}

SharedVertex* SharedEdge::other(SharedVertex* v) {
	if (v == v1)
		return v2;
	if (v == v2)
		return v1;
	return nullptr;
}

Face* Mesh::fillSharedVertices(std::vector<SharedVertex*>& list) {
	size_t n = list.size();
	if (n <= 2) {
		return nullptr;
	}

	for (size_t i = 0; i < n; ++i) {

		if (!connectSharedVertices(list[i], list[(i + 1) % n])) {
			return nullptr;
		}
	}

	Face* face = new Face();
	face->edges.reserve(n);

	Vertex* first_vert = nullptr;
	Edge* prev_edge = nullptr;

	for (size_t i = 0; i < n; ++i) {
		SharedVertex* shared_vertex_a = list[i];
		SharedVertex* shared_vertex_b = list[(i + 1) % n];
		SharedEdge* shared_edge = connectSharedVertices(shared_vertex_a, shared_vertex_b);

		Vertex* v = new Vertex(uv_maps.size());
		v->face = face;
		v->shared_vertex = shared_vertex_a;
		v->in = prev_edge;

		Edge* e = new Edge();
		e->in = v;
		e->out = nullptr;
		e->shared_edge = shared_edge;
		e->face = face;

		v->out = e;

		shared_vertex_a->vertices.push_back(v);
		shared_edge->edges.push_back(e);
		face->edges.push_back(e);

		if (!first_vert)
			first_vert = v;
		else
			prev_edge->out = v;

		prev_edge = e;
	}

	prev_edge->out = first_vert;
	first_vert->in = prev_edge;
	face->updateTriangulation();
	addFace(face);
	return face;
}

UvMap* Mesh::createUvMap(const std::string& uv_map_name) {
	UvMap* uv_map = new UvMap(uv_map_name);
	uv_maps.push_back(uv_map);
	return uv_map;
}

UvMap::UvMap(const std::string& name) : name(name) {}

Vertex::Vertex(uint32_t num_uvs) {
	uvs.reserve(num_uvs);
	for (uint32_t i = 0; i < num_uvs; i++)
		uvs.push_back(nullptr);
}

void Face::updateTriangulation() {
	triangulation.clear();
	uint32_t n = edges.size();
	triangulation.reserve(3 * (n - 2));
	for (uint32_t i = 1; i <= n - 2; ++i) {
		triangulation.push_back(0);
		triangulation.push_back(i);
		triangulation.push_back(i + 1);
	}
}
} // namespace mesh
} // namespace kayo

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoMeshBindings) {
	register_vector<std::string>("VectorString");
	class_<kayo::mesh::UvMap>("UvMap")
		.property("name", &kayo::mesh::UvMap::name, return_value_policy::reference());
	register_vector<kayo::mesh::UvMap*>("VectorUvMap");
	class_<kayo::mesh::Mesh>("Mesh")
		.property("name", &kayo::mesh::Mesh::name, return_value_policy::reference())
		.property("materials", &kayo::mesh::Mesh::materials, return_value_policy::reference())
		.property("uvMaps", &kayo::mesh::Mesh::uv_maps, return_value_policy::reference());
	register_vector<kayo::mesh::Mesh*>("VectorMesh");
}