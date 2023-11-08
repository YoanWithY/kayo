// class VertexSOA {
//     pos: number[] = [];
//     vn: number[] = [];
//     fn: number[] = [];
//     guv: number[] = [];

//     pushNANTriangle() {
//         this.pos.push(NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN);
//         this.vn.push(NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN);
//         this.fn.push(NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN);
//         this.guv.push(NaN, NaN, NaN, NaN, NaN, NaN);
//     }

//     // Pushes the current triangle of the polygon.
//     pushTriangle(P: Polygon) {
//         const v1 = P.current;
//         const v0 = v1.prev;
//         const v2 = v1.next;
//         const face = P.face;

//         vec3.pushInArray(this.pos, v0.position, v1.position, v2.position);
//         vec3.pushInArray(this.vn, v0.vertexNormal, v1.vertexNormal, v2.vertexNormal);
//         vec3.pushInArray(this.fn, face.normal, face.normal, face.normal);
//         vec2.pushInArray(this.guv, v0.generatedUV, v1.generatedUV, v2.generatedUV);
//     }
// }

// class PolygonVertex {
//     vertex: Vertex;

//     /**
//      * The crossproduct of the vector from this to the next vertex and from the to the previous vertex. This is cached in this variable to avoid redundant recalculation.
//      */
//     crossVector = vec3.null;

//     /**
//      * Flag that indicates rather the triangle outgoing from this vertex is degenerate (has an area of 0). This is cached in this variable to avoid redundant recalculation.
//      */
//     isDegenerate = true;

//     /**
//      * Flag that indicates rather this vertex is concave. This is cached in this variable to avoid redundant recalculation.
//      */
//     isConvex = false;

//     /**
//      * The vector of the subtriangle that exists between the vector from the avg-point to this and the avg-point to the next vertex.
//      * This is cached in this variable to avoid redundant recalculation.
//      */
//     subtriangleNormal = vec3.null;

//     next: PolygonVertex = {} as PolygonVertex;
//     prev: PolygonVertex = {} as PolygonVertex;

//     projektion = vec2.null;
//     crossVector2Dz = 0;

//     constructor(vertex: Vertex) {
//         this.vertex = vertex;
//     }

//     updateBufferedInfo3D() {
//         this.crossVector = this.next.position.sub(this.position).cross(this.next.position.sub(this.position));
//         this.isDegenerate = this.crossVector.norm() === 0;
//         this.subtriangleNormal = this.position.sub(this.face.avg).cross(this.next.position.sub(this.face.avg));
//     }

//     updateBufferedInfo2D() {
//         const a = this.next.projektion.sub(this.projektion);
//         const b = this.prev.projektion.sub(this.projektion);
//         this.crossVector2Dz = a.x * b.y - a.y * b.x;
//     }

//     get position() {
//         return this.vertex.position;
//     }

//     get face() {
//         return this.vertex.face;
//     }

//     get vertexNormal() {
//         return this.vertex.vertexNormal;
//     }

//     get generatedUV() {
//         return this.vertex.generatedUV;
//     }

// }

// class Polygon {

//     size = 0;
//     current: PolygonVertex;
//     face: Face;

//     constructor(face: Face, current: PolygonVertex) {
//         this.current = current;
//         this.face = face;
//     }

//     emitVertexFrom2D() {
//         this.current.prev.next = this.current.next;
//         this.current.next.prev = this.current.prev;
//         this.current.next.updateBufferedInfo2D();
//         this.current.prev.updateBufferedInfo2D();
//     }

//     emitVertex() {
//         this.current.prev.next = this.current.next;
//         this.current.next.prev = this.current.prev;
//         this.current.next.updateBufferedInfo3D();
//         this.current.prev.updateBufferedInfo3D();
//     }

//     emitNAN(soa: VertexSOA) {
//         this.size--;
//         soa.pushNANTriangle();
//         this.nextVertex();
//     }

//     emitTriangle(soa: VertexSOA) {
//         this.size--;
//         soa.pushTriangle(this);
//         this.emitVertex();
//         this.nextVertex();
//     }

//     emitTriangleFrom2D(soa: VertexSOA) {
//         this.size--;
//         soa.pushTriangle(this);
//         this.emitVertexFrom2D();
//         this.prevVertex();
//     }

//     nextVertex() {
//         this.current = this.current.next;
//     }

//     prevVertex() {
//         this.current = this.current.prev;
//     }

//     emitAllDegenerate(soa: VertexSOA) {
//         const psize = this.size;
//         for (let i = 0; i < psize; i++) {
//             if (this.current.isDegenerate)
//                 this.emitNAN(soa);
//             else
//                 this.nextVertex();
//         }
//     }

//     emitAllDegenerateFrom2D(soa: VertexSOA) {
//         const psize = this.size;
//         for (let i = 0; i < psize; i++) {
//             if (this.current.crossVector2Dz === 0)
//                 this.emitNAN(soa);
//             else
//                 this.nextVertex();
//         }
//     }

//     isConvex() {
//         for (let i = 0; i < this.size; i++) {
//             if (!this.current.isConvex)
//                 return false;
//             this.nextVertex();
//         }
//         return true;
//     }

//     emitSequentially(soa: VertexSOA) {
//         const max = this.size - 2;
//         for (let i = 0; i < max; i++) {
//             soa.pushTriangle(this);
//             this.nextVertex();
//         }
//     }

//     isEar(): boolean {
//         if (this.current.crossVector2Dz < 0)
//             return false;

//         const v0 = this.current.prev.projektion;
//         const v1 = this.current.projektion;
//         const v2 = this.current.next.projektion;
//         const vec0 = v1.sub(v0);
//         const vec1 = v2.sub(v1);
//         const vec2 = v0.sub(v2);

//         const max = this.size - 2;
//         let vert = this.current.next.next;
//         for (let i = 0; i < max; i++) {
//             const p = vert.projektion;
//             const z0 = vec0.x * (p.y - v0.y) - vec0.y * (p.x - v0.x);
//             const z1 = vec1.x * (p.y - v1.y) - vec1.y * (p.x - v1.x);
//             const z2 = vec2.x * (p.y - v2.y) - vec2.y * (p.x - v2.x);
//             if (z0 >= 0 && z1 >= 0 && z2 >= 0)
//                 return false;
//             vert = vert.next;
//         }

//         return true;
//     }

//     project() {

//     }

//     isCloselyAlignedNormal() {
//         for (let i = 0; i < this.size; i++) {
//             if (this.normal.dot(this.current.subtriangleNormal.normalize()) < 0.5)
//                 return false;
//             this.nextVertex();
//         }
//         return true;
//     }

//     get normal() {
//         return this.face.normal;
//     }

// }

// function triangulate(P: Polygon, soa: VertexSOA) {
//     while (true) {
//         P.emitAllDegenerate(soa);

//         // -> polygon has no degenerate triangles

//         if (P.size < 3)
//             return;

//         if (P.size == 3) {
//             soa.pushTriangle(P);
//             return;
//         }

//         // -> polygon has more than 3 vertices and no degenerate triangles.

//         if (
//             P.normal.norm() == 0    // if normal is 0 some weird symetric edge case occured. We do not even bother trying to solve that systematically.
//             || P.isConvex()         // if the winding of all vertices against the estimated normal is counter clockwise we triangulate it as if it was a simple convex polygon.
//         ) {
//             P.emitSequentially(soa);
//             return;
//         }

//         P.project();

//         // -> at this point the polygon has some area and is concave at some point(s).

//         if (P.isCloselyAlignedNormal()) {
//             while (true) {
//                 if (P.isEar()) {
//                     P.emitTriangleFrom2D(soa);
//                 }

//                 P.emitAllDegenerateFrom2D(soa);

//                 if (P.size < 3)
//                     return;

//                 if (P.size == 3) {
//                     soa.pushTriangle(P);
//                     return;
//                 }

//                 P.nextVertex();
//             }
//         }


//         // -> triangle is complicted enougth that we want to
//         while (true) {
//             if (P.isEar()) {
//                 P.emitTriangle(soa);
//                 break;
//             }
//             P.nextVertex();
//         }
//         // -> start from top
//     }
// }