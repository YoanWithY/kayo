// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    let HEAPU8: any;
}
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export interface ClassHandle {
  isAliasOf(other: ClassHandle): boolean;
  delete(): void;
  deleteLater(): this;
  isDeleted(): boolean;
  clone(): this;
}
export interface DataBlock extends ClassHandle {
  readonly id: number;
  notifyObservers(): void;
}

export interface FCurveSegmentType extends ClassHandle {
}

export interface FCurveSegment extends ClassHandle {
  leftKnot: FCurveKnot | null;
  rightKnot: FCurveKnot | null;
  readonly type: number;
}

export interface FCurveConstantSegment extends FCurveSegment {
}

export interface FCurveKnot extends ClassHandle {
  x: KayoNumber;
  y: KayoNumber;
  slope: KayoNumber;
}

export interface FCurveSegmentVector extends ClassHandle {
  push_back(_0: FCurveSegment | null): void;
  resize(_0: number, _1: FCurveSegment | null): void;
  size(): number;
  get(_0: number): FCurveSegment | undefined;
  set(_0: number, _1: FCurveSegment | null): boolean;
}

export interface FCurveKnotVector extends ClassHandle {
  push_back(_0: FCurveKnot | null): void;
  resize(_0: number, _1: FCurveKnot | null): void;
  size(): number;
  get(_0: number): FCurveKnot | undefined;
  set(_0: number, _1: FCurveKnot | null): boolean;
}

export interface FCurve extends DataBlock {
  segments: FCurveSegmentVector;
  knots: FCurveKnotVector;
  getSegmentIndexAt(_0: KayoNumber): number;
  setValueAt(_0: KayoNumber, _1: KayoNumber, _2: boolean): void;
}

export interface NumberFCurve extends FCurve {
  sample(_0: KayoNumber): KayoNumber;
}

export interface BooleanFCurve extends FCurve {
  sample(_0: KayoNumber): boolean;
}

export interface EnumFCurve extends FCurve {
  sample(_0: KayoNumber): number;
}

export interface SVTConfig extends ClassHandle {
  tileBorder: number;
  logicalTileSize: number;
  physicalTileSize: number;
  largestAtlasMipSize: number;
}

export interface VectorString extends ClassHandle {
  size(): number;
  get(_0: number): EmbindString | undefined;
  push_back(_0: EmbindString): void;
  resize(_0: number, _1: EmbindString): void;
  set(_0: number, _1: EmbindString): boolean;
}

export interface UvMap extends ClassHandle {
  get name(): string;
  set name(value: EmbindString);
}

export interface VectorUvMap extends ClassHandle {
  push_back(_0: UvMap | null): void;
  resize(_0: number, _1: UvMap | null): void;
  size(): number;
  get(_0: number): UvMap | undefined;
  set(_0: number, _1: UvMap | null): boolean;
}

export interface Mesh extends ClassHandle {
  materials: VectorString;
  uvMaps: VectorUvMap;
  get name(): string;
  set name(value: EmbindString);
}

export interface VectorMesh extends ClassHandle {
  push_back(_0: Mesh | null): void;
  resize(_0: number, _1: Mesh | null): void;
  size(): number;
  get(_0: number): Mesh | undefined;
  set(_0: number, _1: Mesh | null): boolean;
}

export interface VectorVertexAttribute extends ClassHandle {
  size(): number;
  get(_0: number): VertexAttribute | undefined;
  push_back(_0: VertexAttribute): void;
  resize(_0: number, _1: VertexAttribute): void;
  set(_0: number, _1: VertexAttribute): boolean;
}

export interface VertexBuffer extends ClassHandle {
  attributes: VectorVertexAttribute;
  arrayStride: number;
  numVertices: number;
  bytesTotal: number;
  readonly data: KayoPointer;
  get stepMode(): string;
  set stepMode(value: EmbindString);
}

export interface RealtimeData extends ClassHandle {
  position: VertexBuffer;
  uvs: VertexBuffer;
  tangentSpace: VertexBuffer;
  build(): void;
}

export interface KayoWASMMinecraftWorld extends ClassHandle {
}

export interface KayoWASMMinecraftDimension extends ClassHandle {
  buildChunk(_0: number, _1: number): number;
  openRegion(_0: number, _1: number, _2: EmbindString): void;
  getPalette(_0: number, _1: number, _2: number): string;
  getSectionView(_0: number, _1: number, _2: number): any;
}

export interface KN extends ClassHandle {
}

export interface Vec2f extends ClassHandle {
  x: number;
  y: number;
}

export interface Vec3f extends ClassHandle {
  x: number;
  y: number;
  z: number;
}

export interface Projection extends ClassHandle {
  width: number;
  height: number;
  getProjection(): KayoPointer;
  setNear(_0: KayoNumber): void;
  getNear(): KayoNumber;
  setNear(_0: KayoNumber): void;
  getNear(): KayoNumber;
}

export interface WasmTask extends ClassHandle {
  run(): void;
}

export interface WasmParseObjTask extends WasmTask {
  run(): void;
}

export interface WasmCreateAtlasTask extends WasmTask {
  run(): void;
}

export interface ImageData extends ClassHandle {
  readonly width: number;
  readonly height: number;
  readonly numComponents: number;
  readonly bytesPerComponent: number;
  readonly bytesPerRow: number;
  readonly numMipLevels: number;
  readonly numStoredMipLevels: number;
  getMipLevelByteSize(_0: number): number;
  getMipWidth(_0: number): number;
  getMipHeight(_0: number): number;
  getMipBytesPerRow(_0: number): number;
  getMipData(_0: number): any;
}

export interface ImageDataUint8 extends ImageData {
}

export type KayoPointer = {
  byteOffset: number,
  byteLength: number
};

export type KayoNumber = [ bigint, bigint ];

export type VertexAttribute = {
  format: EmbindString,
  offset: number,
  shaderLocation: number
};

interface EmbindModule {
  DataBlock: {};
  FCurveSegmentType: {
    CONSTANT: number;
    LINEAR: number;
    HERMITE: number;
  };
  FCurveSegment: {};
  FCurveConstantSegment: {};
  FCurveKnot: {};
  FCurveSegmentVector: {
    new(): FCurveSegmentVector;
  };
  FCurveKnotVector: {
    new(): FCurveKnotVector;
  };
  FCurve: {};
  NumberFCurve: {
    new(_0: number, _1: KayoNumber): NumberFCurve;
  };
  BooleanFCurve: {
    new(_0: number, _1: boolean): BooleanFCurve;
  };
  EnumFCurve: {
    new(_0: number, _1: number, _2: number): EnumFCurve;
  };
  SVTConfig: {
    new(): SVTConfig;
  };
  VectorString: {
    new(): VectorString;
  };
  UvMap: {};
  VectorUvMap: {
    new(): VectorUvMap;
  };
  Mesh: {};
  VectorMesh: {
    new(): VectorMesh;
  };
  VectorVertexAttribute: {
    new(): VectorVertexAttribute;
  };
  VertexBuffer: {};
  RealtimeData: {
    new(_0: Mesh | null): RealtimeData;
  };
  KayoWASMMinecraftWorld: {
    new(_0: EmbindString): KayoWASMMinecraftWorld;
  };
  KayoWASMMinecraftDimension: {
    new(_0: EmbindString, _1: number): KayoWASMMinecraftDimension;
  };
  KN: {
    floor(_0: KayoNumber): KayoNumber;
    ceil(_0: KayoNumber): KayoNumber;
    mod(_0: KayoNumber, _1: KayoNumber): KayoNumber;
    add(_0: KayoNumber, _1: KayoNumber): KayoNumber;
    mul(_0: KayoNumber, _1: KayoNumber): KayoNumber;
    sub(_0: KayoNumber, _1: KayoNumber): KayoNumber;
    div(_0: KayoNumber, _1: KayoNumber): KayoNumber;
    fromDouble(_0: number): KayoNumber;
    toDouble(_0: KayoNumber): number;
    nremap(_0: number, _1: number, _2: number, _3: KayoNumber, _4: KayoNumber): KayoNumber;
    remapn(_0: KayoNumber, _1: KayoNumber, _2: KayoNumber, _3: number, _4: number): number;
    modn(_0: KayoNumber, _1: number): number;
    nmod(_0: number, _1: KayoNumber): KayoNumber;
    nadd(_0: number, _1: KayoNumber): KayoNumber;
    addn(_0: KayoNumber, _1: number): KayoNumber;
    nmul(_0: number, _1: KayoNumber): KayoNumber;
    muln(_0: KayoNumber, _1: number): KayoNumber;
    nsub(_0: number, _1: KayoNumber): KayoNumber;
    subn(_0: KayoNumber, _1: number): KayoNumber;
    ndiv(_0: number, _1: KayoNumber): KayoNumber;
    divn(_0: KayoNumber, _1: number): KayoNumber;
    fromString(_0: EmbindString): KayoNumber;
    toString(_0: KayoNumber): string;
  };
  Vec2f: {};
  Vec3f: {};
  Projection: {};
  WasmTask: {};
  WasmParseObjTask: {
    new(_0: number, _1: EmbindString): WasmParseObjTask;
  };
  WasmCreateAtlasTask: {
    new(_0: number, _1: ImageDataUint8, _2: SVTConfig | null): WasmCreateAtlasTask;
  };
  ImageData: {
    fromImageData(_0: EmbindString, _1: boolean): ImageData | null;
  };
  ImageDataUint8: {};
  staticCastVectorMesh(_0: number): VectorMesh | null;
  deleteArrayUint8(_0: number): void;
  deleteArrayDouble(_0: number): void;
  readFixedPointFromHeap(_0: number): KayoNumber;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
