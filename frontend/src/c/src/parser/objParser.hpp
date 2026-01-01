#pragma once
#include "../mesh/mesh.hpp"
#include "../numerics/vec2.hpp"
#include "../numerics/vec3.hpp"
#include "../task/task.hpp"
#include <vector>

namespace kayo {
namespace parser {
namespace OBJ {

struct Face {
	int32_t material_index;
	std::vector<uint32_t> vertex_indices;
	std::vector<int32_t> normal_index;
	std::vector<int32_t> texture_coordinate_indices;
	int32_t smooth_group;
	std::vector<uint32_t> group_indices;
};

struct Object {
	std::string name;
	std::vector<Face> faces;
};

struct ParseResult {
	std::vector<std::string> comments;
	std::vector<std::string> mtllibs;
	std::vector<FixedPoint::vec3f> vertices;
	std::vector<FixedPoint::vec3f> normals;
	std::vector<FixedPoint::vec2f> texture_coordinates;
	std::vector<std::string> groups_names;
	std::vector<std::string> material_names;
	std::vector<Object> objects;
};

std::vector<kayo::mesh::Mesh*> objBinaryToMesh(ParseResult const& parsed);

class ParseTask : public kayo::Task {
  public:
	std::string obj_file;
	ParseTask(uint32_t task_id, std::string obj_file);
	void run() override;
};

} // namespace OBJ
} // namespace parser
} // namespace kayo