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
export interface FCurveConstantSegmentMode extends ClassHandle {
}

export interface FCurveSegmentType extends ClassHandle {
}

export interface FCurveSegment extends ClassHandle {
  leftKnot: FCurveKnot | null;
  rightKnot: FCurveKnot | null;
  readonly type: number;
  getCurveSegment(): NonUniformSplineCurveSegment1D | null;
}

export interface FCurveConstantSegment extends FCurveSegment {
  readonly valueMode: number;
  value: KayoNumber;
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

export interface FCurve extends ClassHandle {
  segments: FCurveSegmentVector;
  knots: FCurveKnotVector;
  getSegmentIndexAt(_0: KayoNumber): number;
  insertKnot(_0: KayoNumber, _1: KayoNumber, _2: boolean): void;
}

export interface TimeLine extends ClassHandle {
  simulationTimeVelocity: FCurve;
  simulationTime: KN;
  framesPerSecond: KN;
}

export interface KayoWASMModule extends ClassHandle {
}

export interface KayoWASMInstance extends ClassHandle {
  project: ProjectConfig;
  registerModule(_0: KayoWASMModule): number;
}

export interface RenderConfigMap extends ClassHandle {
  get(_0: EmbindString): RenderConfig | null;
}

export interface ProjectConfig extends ClassHandle {
  renderConfigs: RenderConfigMap;
  timeLine: TimeLine;
}

export interface SwapChainConfig extends ClassHandle {
  bitDepth: number;
  readonly bitDepth_ptr: number;
  readonly colorSpace_ptr: number;
  readonly toneMappingMode_ptr: number;
  get colorSpace(): string;
  set colorSpace(value: EmbindString);
  get toneMappingMode(): string;
  set toneMappingMode(value: EmbindString);
}

export interface AntialiasingConfig extends ClassHandle {
  msaa: number;
  readonly msaa_ptr: number;
  readonly interpolation_ptr: number;
  get interpolation(): string;
  set interpolation(value: EmbindString);
}

export interface CustomColorQuantisationConfig extends ClassHandle {
  useCustomColorQuantisation: boolean;
  useDithering: boolean;
  readonly useCustomColorQuantisation_ptr: number;
  readonly useDithering_ptr: number;
}

export interface GeneralConfig extends ClassHandle {
  swapChain: SwapChainConfig;
  customColorQuantisation: CustomColorQuantisationConfig;
}

export interface SpecificRendererConfig extends ClassHandle {
  get rendererName(): string;
  set rendererName(value: EmbindString);
}

export interface RealtimeConfig extends SpecificRendererConfig {
  antialiasing: AntialiasingConfig;
}

export interface RenderConfig extends ClassHandle {
  specificRenderConfig: SpecificRendererConfig | null;
  general: GeneralConfig;
  get name(): string;
  set name(value: EmbindString);
}

export interface KayoR3Object extends ClassHandle {
  getParent(): KayoR3Object | null;
}

export interface WasmTask extends ClassHandle {
  run(): void;
}

export interface WasmCreateAtlasTask extends WasmTask {
  run(): void;
}

export interface KayoWASMMinecraftModule extends ClassHandle {
  createWorldData(_0: EmbindString): KayoWASMMinecraftWorld;
}

export interface KayoWASMMinecraftWorld extends ClassHandle {
  createDimensionData(_0: EmbindString, _1: number): KayoWASMMinecraftDimension;
}

export interface KayoWASMMinecraftDimension extends ClassHandle {
  buildChunk(_0: number, _1: number): number;
  openRegion(_0: number, _1: number, _2: EmbindString): void;
  getPalette(_0: number, _1: number, _2: number): string;
  getSectionView(_0: number, _1: number, _2: number): any;
}

export interface KN extends ClassHandle {
}

export interface VectorNonUniformSplineCurveSegment1D extends ClassHandle {
  push_back(_0: NonUniformSplineCurveSegment1D | null): void;
  resize(_0: number, _1: NonUniformSplineCurveSegment1D | null): void;
  size(): number;
  get(_0: number): NonUniformSplineCurveSegment1D | undefined;
  set(_0: number, _1: NonUniformSplineCurveSegment1D | null): boolean;
}

export interface UniformSplineCurve1D extends ClassHandle {
}

export interface NonUniformSplineCurve1D extends ClassHandle {
  segments: VectorNonUniformSplineCurveSegment1D;
  getSegemtIndexAt(_0: KayoNumber): number;
  sample(_0: KayoNumber): KayoNumber;
}

export interface UniformSplineCurveSegment1D extends ClassHandle {
  sampleUniform(_0: KN): KN;
}

export interface ConstantUniformSplineCurve1D extends UniformSplineCurveSegment1D {
}

export interface NonUniformSplineCurveSegment1D extends ClassHandle {
  sampleNonUniform(_0: KN): KN;
  sampleRangeAuto(_0: KayoNumber, _1: KayoNumber, _2: KayoNumber, _3: KayoNumber, _4: number, _5: number, _6: number, _7: number, _8: number): KayoPointer;
}

export interface ConstantNonUniformSplineCurveSegment1D extends NonUniformSplineCurveSegment1D {
}

export interface LinearNonUniformSplineCurveSegment1D extends NonUniformSplineCurveSegment1D {
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

interface EmbindModule {
  FCurveConstantSegmentMode: {
    VALUE: number;
    LEFT_KNOT: number;
    RIGHT_KNOT: number;
  };
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
  TimeLine: {};
  KayoWASMModule: {};
  KayoWASMInstance: {
    new(): KayoWASMInstance;
  };
  RenderConfigMap: {};
  ProjectConfig: {};
  SwapChainConfig: {};
  AntialiasingConfig: {};
  CustomColorQuantisationConfig: {};
  GeneralConfig: {};
  SpecificRendererConfig: {};
  RealtimeConfig: {};
  RenderConfig: {};
  KayoR3Object: {};
  WasmTask: {};
  WasmCreateAtlasTask: {
    new(_0: number, _1: ImageDataUint8): WasmCreateAtlasTask;
  };
  KayoWASMMinecraftModule: {
    new(_0: KayoWASMInstance): KayoWASMMinecraftModule;
  };
  KayoWASMMinecraftWorld: {};
  KayoWASMMinecraftDimension: {};
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
    toString(_0: KayoNumber): string;
  };
  VectorNonUniformSplineCurveSegment1D: {
    new(): VectorNonUniformSplineCurveSegment1D;
  };
  UniformSplineCurve1D: {};
  NonUniformSplineCurve1D: {};
  UniformSplineCurveSegment1D: {};
  ConstantUniformSplineCurve1D: {};
  NonUniformSplineCurveSegment1D: {};
  ConstantNonUniformSplineCurveSegment1D: {};
  LinearNonUniformSplineCurveSegment1D: {};
  ImageData: {
    fromImageData(_0: EmbindString, _1: boolean): ImageData | null;
  };
  ImageDataUint8: {
    empty(_0: number, _1: number, _2: number): ImageDataUint8 | null;
  };
  deleteArrayUint8(_0: number): void;
  deleteArrayDouble(_0: number): void;
  readFixedPointFromHeap(_0: number): KayoNumber;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
