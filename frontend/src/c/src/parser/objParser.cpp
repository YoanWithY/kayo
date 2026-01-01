#include "objParser.hpp"
#include <algorithm>
#include <charconv>
#include <cstdint>
#include <emscripten/bind.h>
#include <emscripten/em_asm.h>
#include <iostream>
#include <ranges>
#include <string>
#include <string_view>
#include <unordered_set>

namespace kayo {
namespace parser {
namespace OBJ {
static std::string_view trim(std::string_view s) {
	if (s.empty())
		return s;
	while (!s.empty() && (s.front() == ' ' || s.front() == '\t' || s.front() == '\r'))
		s.remove_prefix(1);
	while (!s.empty() && (s.back() == ' ' || s.back() == '\t' || s.back() == '\r'))
		s.remove_suffix(1);
	return s;
}

template <typename Subrange>
static std::string_view subrange_to_view(Subrange const& r) {
	auto it = std::ranges::begin(r);
	if (it == std::ranges::end(r))
		return {};
	const char* p = &*it;
	return {p, static_cast<size_t>(std::ranges::distance(r))};
}

static FixedPoint::vec3f parseVec3(std::string_view rest) {
	FixedPoint::vec3f out(0.0f);
	uint32_t i = 0;
	for (auto t : rest | std::views::split(' ')) {
		std::string_view tok{&*t.begin(), static_cast<size_t>(std::ranges::distance(t))};
		tok = trim(tok);
		if (tok.empty())
			continue;
		out[i] = static_cast<float>(std::atof(tok.data()));
		if (++i >= 3)
			break;
	}
	return out;
}

static FixedPoint::vec2f parseVec2(std::string_view rest) {
	FixedPoint::vec2f out(0.0f);
	uint32_t i = 0;
	for (auto t : rest | std::views::split(' ')) {
		std::string_view tok{&*t.begin(), static_cast<size_t>(std::ranges::distance(t))};
		tok = trim(tok);
		if (tok.empty())
			continue;
		out[i] = static_cast<float>(std::atof(tok.data()));
		if (++i >= 2)
			break;
	}
	return out;
}

static int32_t getOrAddName(std::vector<std::string>& names, std::string_view nv) {
	std::string s(nv);
	auto it = std::find(names.begin(), names.end(), s);
	if (it != names.end())
		return static_cast<int32_t>(std::distance(names.begin(), it));
	names.emplace_back(std::move(s));
	return static_cast<int32_t>(names.size() - 1);
}

static int32_t parseIntOrZero(std::string_view sv) {
	sv = trim(sv);
	if (sv.empty())
		return 0;
	int32_t v = 0;
	std::from_chars(sv.data(), sv.data() + sv.size(), v);
	return v;
}

static void splitFaceTokenToIndices(
	std::string_view token,
	int32_t& out_vi,
	int32_t& out_ti,
	int32_t& out_ni,
	size_t nVerts,
	size_t nTexs,
	size_t nNorms) {
	out_vi = out_ti = out_ni = -1;
	if (token.empty())
		return;

	size_t a = token.find('/');
	if (a == std::string_view::npos) {
		int32_t idx = parseIntOrZero(token);
		if (idx < 0)
			idx = static_cast<int32_t>(nVerts) + idx + 1;
		if (idx > 0)
			out_vi = idx - 1;
		return;
	}

	// v part
	{
		std::string_view vpart = token.substr(0, a);
		int32_t idx = parseIntOrZero(vpart);
		if (idx < 0)
			idx = static_cast<int32_t>(nVerts) + idx + 1;
		if (idx > 0)
			out_vi = idx - 1;
	}

	size_t b = token.find('/', a + 1);
	if (b == std::string_view::npos) {
		// v/vt
		std::string_view tpart = token.substr(a + 1);
		int32_t idx = parseIntOrZero(tpart);
		if (idx < 0)
			idx = static_cast<int32_t>(nTexs) + idx + 1;
		if (idx > 0)
			out_ti = idx - 1;
		return;
	}

	// v/vt/vn or v//vn
	std::string_view tpart = token.substr(a + 1, b - (a + 1));
	if (!tpart.empty()) {
		int32_t idx = parseIntOrZero(tpart);
		if (idx < 0)
			idx = static_cast<int32_t>(nTexs) + idx + 1;
		if (idx > 0)
			out_ti = idx - 1;
	}

	std::string_view npart = token.substr(b + 1);
	if (!npart.empty()) {
		int32_t idx = parseIntOrZero(npart);
		if (idx < 0)
			idx = static_cast<int32_t>(nNorms) + idx + 1;
		if (idx > 0)
			out_ni = idx - 1;
	}
}

ParseResult parseObj(std::string const& contents) {
	ParseResult result;

	int32_t activeMaterial = -1;
	int32_t activeSmooth = -1;
	std::vector<uint32_t> activeGroups; // store as int32_t, convert when assigning

	for (auto lineRange : contents | std::views::split('\n')) {
		std::string_view line = subrange_to_view(lineRange);
		line = trim(line);
		if (line.empty())
			continue;
		if (line.front() == '#') {
			result.comments.emplace_back(line);
			continue;
		}

		auto sp = line.find(' ');
		std::string_view key = (sp == std::string_view::npos ? line : line.substr(0, sp));
		std::string_view rest = (sp == std::string_view::npos ? std::string_view{} : trim(line.substr(sp + 1)));

		if (key == "v")
			result.vertices.push_back(parseVec3(rest));

		else if (key == "vt")
			result.texture_coordinates.push_back(parseVec2(rest));

		else if (key == "vn")
			result.normals.push_back(parseVec3(rest));

		else if (key == "mtllib") {
			if (!rest.empty())
				result.mtllibs.emplace_back(rest);
		}

		else if (key == "usemtl") {
			if (rest.empty())
				activeMaterial = -1;
			else
				activeMaterial = getOrAddName(result.material_names, rest);
		}

		else if (key == "s") {
			if (rest == "off" || rest == "0")
				activeSmooth = -1;
			else
				activeSmooth = parseIntOrZero(rest);
		}

		else if (key == "g") {
			activeGroups.clear();
			for (auto r : rest | std::views::split(' ')) {
				std::string_view gv = subrange_to_view(r);
				if (gv.empty())
					continue;
				activeGroups.push_back(static_cast<uint32_t>(getOrAddName(result.groups_names, gv)));
			}
		}

		else if (key == "o")
			result.objects.push_back({std::string(rest), {}});

		else if (key == "f") {
			if (rest.empty())
				continue;

			Face face;
			face.material_index = activeMaterial;
			face.smooth_group = activeSmooth;
			for (uint32_t g : activeGroups)
				face.group_indices.push_back(g);

			size_t nV = result.vertices.size();
			size_t nT = result.texture_coordinates.size();
			size_t nN = result.normals.size();

			for (auto tokRange : rest | std::views::split(' ')) {
				std::string_view tok = subrange_to_view(tokRange);
				if (tok.empty())
					continue;
				int32_t vi, ti, ni;
				splitFaceTokenToIndices(tok, vi, ti, ni, nV, nT, nN);
				face.vertex_indices.push_back(static_cast<uint32_t>(vi));
				face.texture_coordinate_indices.push_back(ti);
				face.normal_index.push_back(ni);
			}

			if (result.objects.size() == 0)
				result.objects.push_back({"", {}});
			result.objects.back().faces.push_back(std::move(face));
		}
	}
	return result;
}

std::vector<kayo::mesh::Mesh*> objBinaryToMesh(ParseResult const& parsed) {
	using namespace kayo::mesh;
	std::vector<Mesh*> meshes;

	for (auto const& obj : parsed.objects) {
		Mesh* mesh = new Mesh();
		mesh->name = obj.name;
		uint32_t attr_smooth = mesh->ensureFaceAttribute("smooth_group");
		uint32_t attr_sharp = mesh->ensureEdgeAttribute("sharp");

		// Get texture coordinates of this object.
		std::map<uint32_t, UvCoordinate*> uv_index_map;
		for (auto const& obj_face : obj.faces) {
			for (int32_t uv_index : obj_face.texture_coordinate_indices) {
				if (uv_index != -1) {
					uint32_t uv_index_u = static_cast<uint32_t>(uv_index);
					uv_index_map[uv_index_u] = new UvCoordinate(parsed.texture_coordinates[uv_index_u]);
				}
			}
		}

		UvMap* uv_map = nullptr;
		if (uv_index_map.size() > 0)
			uv_map = mesh->createUvMap("uv_map_1");

		if (uv_map) {
			for (const auto& [key, value] : uv_index_map)
				uv_map->uv_coordinates.push_back(value);
		}

		// Get vertices used in this object.
		std::map<uint32_t, SharedVertex*> vertex_index_map;
		for (auto const& obj_face : obj.faces) {
			std::vector<SharedVertex*> face_shared_vertices;
			face_shared_vertices.reserve(obj_face.vertex_indices.size());

			for (uint32_t vert_index : obj_face.vertex_indices) {
				SharedVertex* sv;
				if (vertex_index_map.contains(vert_index)) {
					sv = vertex_index_map.at(vert_index);
				} else {
					sv = new SharedVertex();
					sv->position = parsed.vertices[vert_index];
					mesh->addSharedVertex(sv);
					vertex_index_map[vert_index] = sv;
				}
				face_shared_vertices.push_back(sv);
			}

			kayo::mesh::Face* mesh_face = mesh->fillSharedVertices(face_shared_vertices);
			if (!mesh_face)
				continue;

			if (obj_face.material_index >= 0 && static_cast<size_t>(obj_face.material_index) < parsed.material_names.size()) {
				const std::string& mname = parsed.material_names[static_cast<size_t>(obj_face.material_index)];
				uint32_t mat_index = mesh->addMaterial(mname);
				mesh_face->material_index = mat_index;
			}

			mesh_face->attributes[attr_smooth] = obj_face.smooth_group;

			size_t n = mesh_face->edges.size();
			for (size_t i = 0; i < n; ++i) {
				Vertex* vert = mesh_face->edges[i]->in;
				int32_t norm_index = obj_face.normal_index[i];
				if (norm_index >= 0)
					vert->normal = parsed.normals[static_cast<uint32_t>(norm_index)];

				if (uv_map) {
					int32_t tc_index = obj_face.texture_coordinate_indices[i];
					if (tc_index >= 0) {
						vert->uvs[0] = uv_index_map[static_cast<uint32_t>(tc_index)];
					}
				}
			}
		}

		for (SharedEdge* e : mesh->getSharedEdges()) {
			std::unordered_set<int32_t> groups;
			for (Edge* ed : e->edges) {
				if (!ed->face)
					continue;
				int32_t g = -1;
				auto it = ed->face->attributes.find(attr_smooth);
				if (it != ed->face->attributes.end())
					g = std::any_cast<int32_t>(it->second);
				groups.insert(g);
			}

			bool sharp = (groups.size() > 1);
			e->attributes[attr_sharp] = sharp;
		}

		for (kayo::mesh::Face* f : mesh->getFaces()) {
			f->attributes.erase(attr_smooth);
		}

		meshes.push_back(mesh);
	}

	return meshes;
}

static void* createMesh(void* arg) {
	pthread_detach(pthread_self());
	ParseTask* task = reinterpret_cast<ParseTask*>(arg);
	std::vector<kayo::mesh::Mesh*>* a = new std::vector<kayo::mesh::Mesh*>(objBinaryToMesh(parseObj(task->obj_file)));
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdollar-in-identifier-extension"
	MAIN_THREAD_ASYNC_EM_ASM({
		const vector = window.kayo.wasmx.wasm.staticCastVectorMesh($1);
		window.kayo.taskQueue.wasmTaskFinished($0, {meshes : vector}); }, task->task_id, a);
#pragma GCC diagnostic pop
	return nullptr;
}

ParseTask::ParseTask(uint32_t task_id, std::string obj_file) : Task(task_id), obj_file(std::move(obj_file)) {}
void ParseTask::run() {
	pthread_t thread;
	int result = pthread_create(&thread, nullptr, &createMesh, this);
	if (result != 0)
		std::cerr << "Error: Unable to create thread, " << result << std::endl;
}
} // namespace OBJ
} // namespace parser
} // namespace kayo

static std::vector<kayo::mesh::Mesh*>* staticCastVectorMesh(uintptr_t ptr) {
	return reinterpret_cast<std::vector<kayo::mesh::Mesh*>*>(ptr);
}

using namespace emscripten;
EMSCRIPTEN_BINDINGS(KayoObjParseTask) {
	class_<kayo::parser::OBJ::ParseTask, base<kayo::Task>>("WasmParseObjTask")
		.constructor<uint32_t, std::string>()
		.function("run", &kayo::parser::OBJ::ParseTask::run);
	function("staticCastVectorMesh", &staticCastVectorMesh, return_value_policy::take_ownership());
}