import vec2 from "../math/vec2";
import vec3 from "../math/vec3";

class Vertex {
	/**
	 * The {@link SharedVertex} this Vertex is associated to.
	 */
	private readonly _sharedVertex: SharedVertex;
	private readonly _face: Face;

	vertexNormal = vec3.X;
	generatedUV = vec2.NULL;
	vertexAttribs: number[][] = [];

	/**
	 * The next vertex in the cyclic doubly linked list.
	 */
	next: Vertex = {} as Vertex;

	/**
	 * The previous vertex in the cyclic doubly linked list.
	 */
	prev: Vertex = {} as Vertex;

	/**
	 * Constructs a `Vertex` and establishes the required association.
	 * @param sharedVertex the parent
	 * @param face the face the vertex holds data for
	 */
	constructor(sharedVertex: SharedVertex, face: Face) {
		sharedVertex.children.push(this);
		this._sharedVertex = sharedVertex;
		this._face = face;
	}

	/**
	 * Getter for the {@link SharedVertex} of this Vertex.
	 */
	get sharedVertex() {
		return this._sharedVertex;
	}

	get position() {
		return this._sharedVertex.va_position;
	}

	get faceNormal() {
		return this._face.normal;
	}

	get face() {
		return this._face;
	}
}

/**
 * A SharedVertex represents a set of Vertices and stores shared vertex attribs for those vertices that are assoziated
 * with this
 */
class SharedVertex {
	children: Vertex[] = [];

	/**
	 * The Position
	 */
	va_position: vec3 = vec3.NULL;

	/**
	 * The {@link SharedEdge}s this {@link SharedVertex} is assoziated to.
	 */
	sharedEdges: Set<SharedEdge> = new Set();

	constructor(pos: vec3) {
		this.va_position = pos;
	}

	public findSharedEdgeTo(sv: SharedVertex): SharedEdge | undefined {
		for (const se of this.sharedEdges) if (se.equals(this, sv)) return se;
		return undefined;
	}

	public associateToSharedEdge(se: SharedEdge) {
		this.sharedEdges.add(se);
	}

	/**
	 *
	 * @param se The SharedEdge to disconect from.
	 * @returns true if the SharedEdge was found and deleted.
	 */
	public disconnectFromSharedEdge(se: SharedEdge) {
		return this.sharedEdges.delete(se);
	}
}

class SharedEdge {
	sv1: SharedVertex;
	sv2: SharedVertex;

	/**
	 * Constructs a SharedEdge from the given SharedVertices. This method atomaticaly associates the handed SharedVertices with the newly constructed SharedEdge.
	 * @param sharedVertex1 A SharedVertex of the SharedEdge.
	 * @param sharedVertex2 The other SharedVertex of the SharedEdge.
	 */
	constructor(sharedVertex1: SharedVertex, sharedVertex2: SharedVertex) {
		this.sv1 = sharedVertex1;
		this.sv2 = sharedVertex2;
		sharedVertex1.associateToSharedEdge(this);
		sharedVertex2.associateToSharedEdge(this);
	}

	static connect(...svs: SharedVertex[]) {
		const SEs: SharedEdge[] = [];
		for (let i = 1; i < svs.length; i++) SEs.push(new SharedEdge(svs[i - 1], svs[i]));
		return SEs;
	}

	/**
	 * Returns the other SharedVertex of this SharedEdge.
	 * @param sv The SharedVertex to get the other from.
	 * @returns The other SharedVertex or undefined if sv is not a SharedVertex of this SharedEdge.
	 */
	public other(sv: SharedVertex) {
		if (sv === this.sv1) return this.sv2;
		if (sv === this.sv2) return this.sv1;
		return undefined;
	}

	/**
	 * Checks if a given SharedVertex is part of this SharedEdge.
	 * @param sv The SharedVertex to check for.
	 * @returns Wether or not the given Sahred vertex is part of this SharedEdge.
	 */
	public contains(sv: SharedVertex): boolean {
		return sv === this.sv1 || sv === this.sv2;
	}

	/**
	 * Returns if this SharedEdge equals a connection between ``sv1`` and ``sv2``.
	 * This evaluation is order independent.
	 * @param v1 the first SharedVertex
	 * @param v2 tge second SharedVertex
	 * @returns the result of the evaluation
	 */
	public equals(v1: SharedVertex, v2: SharedVertex) {
		return this.contains(v1) && this.contains(v2);
	}
}

/**
 * A Face represents a tuple of {@link Vertex}s.
 * It provides functionalies realated to the geometrical idea of a Face as well as functionalities to traverse the
 * Mesh data structure.
 */
class Face {
	vertices: Vertex[] = [];
	private _normal = vec3.X;
	private _avg = vec3.NULL;

	private updateBufferedInfo() {
		this._avg = vec3.NULL;
		for (const vert of this.vertices) {
			this._avg[0] += vert.position.x;
			this._avg[1] += vert.position.y;
			this._avg[2] += vert.position.z;
		}
	}

	addVertex(v: Vertex) {
		if (this.vertices.indexOf(v) === -1) return;

		this.vertices.push(v);
		this.updateBufferedInfo();
	}

	get normal() {
		return this._normal;
	}

	get avg() {
		return this._avg;
	}
}

export default class Mesh {
	faces: Face[] = [];
	edges: SharedEdge[] = [];
	vertices: SharedVertex[] = [];

	pushSharedVertex(pos: vec3) {
		this.vertices.push(new SharedVertex(pos));
	}

	/**
	 * @param v1
	 * @param v2
	 * @returns either the SharedEdge that matches the arguments or a new SharedEdge constructed by the arguments
	 */
	getOrCreateSharedEdge(v1: SharedVertex, v2: SharedVertex) {
		let se = v1.findSharedEdgeTo(v2);
		if (se) return se;
		se = new SharedEdge(v1, v2);
		this.edges.push(se);
		return se;
	}

	append(mesh: Mesh) {
		this.vertices = this.vertices.concat(mesh.vertices);
		this.edges = this.edges.concat(mesh.edges);
		this.faces = this.faces.concat(mesh.faces);
	}
}
