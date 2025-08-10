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
export interface FCurveSegment extends ClassHandle {
}

export interface FCurveKnot extends ClassHandle {
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
  curve: NonUniformSplineCurve1D;
}

export interface TimeLine extends ClassHandle {
  simulationTimeVelocity: FCurve;
  simulationTime: KayoNumber;
  framesPerSecond: KayoNumber;
}

export interface KayoJSVCNumber extends ClassHandle {
  getObservationID(): number;
  getValue(): string;
  setValue(_0: EmbindString): void;
}

export interface KayoJSVCString extends ClassHandle {
  getObservationID(): number;
  getValue(): string;
  setValue(_0: EmbindString): void;
}

export interface KayoWASMModule extends ClassHandle {
}

export interface KayoWASMInstance extends ClassHandle {
  project: ProjectConfig;
  registerModule(_0: KayoWASMModule): number;
}

export interface RenderStatesMap extends ClassHandle {
  get(_0: EmbindString): RenderState | null;
}

export interface ProjectConfig extends ClassHandle {
  renderStates: RenderStatesMap;
  timeLine: TimeLine;
}

export interface SwapChainConfig extends ClassHandle {
  bitDepth: number;
  get colorSpace(): string;
  set colorSpace(value: EmbindString);
  get toneMappingMode(): string;
  set toneMappingMode(value: EmbindString);
}

export interface CustomColorQuantisationConfig extends ClassHandle {
  readonly useCustomColorQuantisation: boolean;
  readonly useDithering: boolean;
}

export interface AntialiasingConfig extends ClassHandle {
  msaa: number;
  get interpolation(): string;
  set interpolation(value: EmbindString);
}

export interface GeneralConfig extends ClassHandle {
  swapChain: SwapChainConfig;
  customColorQuantisation: CustomColorQuantisationConfig;
}

export interface SpecificRendererConfig extends ClassHandle {
}

export interface RealtimeConfig extends SpecificRendererConfig {
  antialiasing: AntialiasingConfig;
}

export interface RenderConfig extends ClassHandle {
  general: GeneralConfig;
  specificRenderer: SpecificRendererConfig | null;
  needsContextReconfiguration: boolean;
  needsPipelineRebuild: boolean;
}

export interface SwapChainState extends ClassHandle {
  bitDepth: KayoJSVCNumber;
  colorSpace: KayoJSVCString;
  toneMappingMode: KayoJSVCString;
}

export interface AntialiasingState extends ClassHandle {
  msaa: KayoJSVCNumber;
  interpolation: KayoJSVCString;
}

export interface CustomColorQuantisationState extends ClassHandle {
  useCustomColorQuantisation: KayoJSVCString;
  useDithering: KayoJSVCString;
}

export interface GeneralState extends ClassHandle {
  swapChain: SwapChainState;
  customColorQuantisation: CustomColorQuantisationState;
}

export interface SpecificRendererState extends ClassHandle {
  get rendererName(): string;
  set rendererName(value: EmbindString);
}

export interface RealtimeState extends SpecificRendererState {
  antialiasing: AntialiasingState;
}

export interface RenderState extends ClassHandle {
  config: RenderConfig;
  specificRenderer: SpecificRendererState | null;
  general: GeneralState;
  applyToConfig(): void;
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

export interface KayoNumber extends ClassHandle {
}

export interface UniformSplineCurve1D extends ClassHandle {
}

export interface NonUniformSplineCurve1D extends ClassHandle {
  sample(_0: EmbindString): string;
}

export interface UniformSplineCurveSegment1D extends ClassHandle {
  sampleUniform(_0: KayoNumber): KayoNumber;
}

export interface ConstantUniformSplineCurve1D extends UniformSplineCurveSegment1D {
  sampleUniform(_0: KayoNumber): KayoNumber;
}

export interface NonUniformSplineCurveSegment1D extends ClassHandle {
  sampleNonUniform(_0: KayoNumber): KayoNumber;
}

export interface ConstantNonUniformSplineCurve1D extends NonUniformSplineCurveSegment1D {
  sampleNonUniform(_0: KayoNumber): KayoNumber;
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

interface EmbindModule {
  FCurveSegment: {};
  FCurveKnot: {};
  FCurveSegmentVector: {
    new(): FCurveSegmentVector;
  };
  FCurveKnotVector: {
    new(): FCurveKnotVector;
  };
  FCurve: {};
  TimeLine: {};
  KayoJSVCNumber: {
    new(_0: KayoNumber): KayoJSVCNumber;
  };
  KayoJSVCString: {};
  KayoWASMModule: {};
  KayoWASMInstance: {
    new(): KayoWASMInstance;
  };
  RenderStatesMap: {};
  ProjectConfig: {};
  SwapChainConfig: {};
  CustomColorQuantisationConfig: {};
  AntialiasingConfig: {};
  GeneralConfig: {};
  SpecificRendererConfig: {};
  RealtimeConfig: {};
  RenderConfig: {};
  SwapChainState: {};
  AntialiasingState: {};
  CustomColorQuantisationState: {};
  GeneralState: {};
  SpecificRendererState: {};
  RealtimeState: {};
  RenderState: {};
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
  KayoNumber: {
    fromDouble(_0: number): string;
    toDouble(_0: EmbindString): number;
    toString(_0: EmbindString): string;
  };
  UniformSplineCurve1D: {};
  NonUniformSplineCurve1D: {};
  UniformSplineCurveSegment1D: {};
  ConstantUniformSplineCurve1D: {};
  NonUniformSplineCurveSegment1D: {};
  ConstantNonUniformSplineCurve1D: {};
  ImageData: {
    fromImageData(_0: EmbindString, _1: boolean): ImageData | null;
  };
  ImageDataUint8: {
    empty(_0: number, _1: number, _2: number): ImageDataUint8 | null;
  };
  deleteArrayUint8(_0: number): void;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
