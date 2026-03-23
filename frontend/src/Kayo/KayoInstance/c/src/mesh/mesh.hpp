#pragma once
#include "../numerics/vec2.hpp"
#include "../numerics/vec3.hpp"
#include <any>
#include <map>
#include <vector>

namespace kayo {
namespace mesh {

class Vertex;
class Edge;
class SharedEdge;
class SharedVertex;
class Face;

class SharedVertex {
  public:
	FixedPoint::vec3f position;
	std::vector<Vertex*> vertices;
	std::vector<SharedEdge*> shared_edges;
};

class SharedEdge {
  public:
	std::vector<Edge*> edges;
	SharedVertex* v1;
	SharedVertex* v2;
	std::map<uint32_t, std::any> attributes;
	SharedVertex* other(SharedVertex*);
};

/**
 * A UV coordinate that may be used by multiple Vertices.
 */
using UvCoordinate = FixedPoint::vec2f;

class Vertex {
  public:
	Vertex(uint32_t num_uvs);
	/**
	 * The face the vertex belongs to.
	 * Shall not be nullptr.
	 */
	Face* face;
	/**
	 * The shared vertex the vertex belongs to.
	 * Shall not be nullptr.
	 */
	SharedVertex* shared_vertex;
	/**
	 * The object space normal of this Vertex.
	 */
	FixedPoint::vec3f normal;
	/**
	 * The size shall be equal to the number of uv_maps in the Mesh this Vertex belongs to.
	 */
	std::vector<UvCoordinate*> uvs;
	/**
	 * The incomming Edge.
	 * This Vertex shall be the outgoing Vertex of that Edge.
	 */
	Edge* in;
	/**
	 * The outgoing Edge.
	 * This Vertex ahll be the incomming Vertex of that Edge.
	 */
	Edge* out;
	/**
	 * Optional custom vertex attributes of this Vertex.
	 */
	std::map<uint32_t, std::any> attributes;
};

/**
 * From a data structure perspective Edges sit between Faces and SharedEdges.
 * They make up the Face.
 */
class Edge {
  public:
	/**
	 * The Vertex going into this Edge. (First Vertex)
	 */
	Vertex* in;
	/**
	 * The Vertex going out of the Edge. (Second Vertex)
	 */
	Vertex* out;
	/**
	 * The SharedEdge this Edge belongs to.
	 */
	SharedEdge* shared_edge;
	/**
	 * The Face this Edge belongs to.
	 */
	Face* face;
};

class Face {
  public:
	/**
	 * The index of the Material in the materials list of the Mesh this Face belongs to
	 * that shall be used to render this Face.
	 */
	uint32_t material_index;
	/**
	 * The (CCW) Edges making up this Face.
	 */
	std::vector<Edge*> edges;
	/**
	 * The cached triangulation of this Face.
	 */
	std::vector<uint32_t> triangulation;
	/**
	 * Optional custom Face attributes of this Face.
	 */
	std::map<uint32_t, std::any> attributes;
	void updateTriangulation();
};

class UvMap {
  public:
	std::string name;
	std::vector<UvCoordinate*> uv_coordinates;
	UvMap(const std::string& name);
};

class Mesh {
  private:
	std::map<std::string, uint32_t> vertex_attributes;
	std::map<std::string, uint32_t> edge_attributes;
	std::map<std::string, uint32_t> face_attributes;
	std::vector<SharedVertex*> shared_vertices;
	std::vector<SharedEdge*> shared_edges;
	std::vector<Face*> faces;
	bool addSharedEdge(SharedEdge*);
	bool addFace(Face*);

  public:
	std::string name;
	std::vector<std::string> materials;
	std::vector<UvMap*> uv_maps;
	bool addSharedVertex(SharedVertex*);
	UvMap* createUvMap(const std::string& uv_map_name);
	SharedEdge* connectSharedVertices(SharedVertex*, SharedVertex*);
	Face* fillSharedVertices(std::vector<SharedVertex*>&);
	uint32_t addMaterial(const std::string& material_name);

	const std::vector<std::string>& getMaterials() const;
	const std::vector<SharedVertex*>& getSharedVertices() const;
	const std::vector<SharedEdge*>& getSharedEdges() const;
	const std::vector<Face*>& getFaces() const;

	uint32_t ensureVertexAttribute(const std::string& attrib_name);
	uint32_t ensureEdgeAttribute(const std::string& attrib_name);
	uint32_t ensureFaceAttribute(const std::string& attrib_name);
};
} // namespace mesh
} // namespace kayo