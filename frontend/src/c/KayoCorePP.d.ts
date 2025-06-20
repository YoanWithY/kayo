// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
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
}

export interface SwapChainConfig extends ClassHandle {
  bitDepth: number;
  get colorSpace(): string;
  set colorSpace(value: EmbindString);
  get toneMappingMode(): string;
  set toneMappingMode(value: EmbindString);
}

export interface TransparencyConfig extends ClassHandle {
  transparentBackground: boolean;
}

export interface AntialiasingConfig extends ClassHandle {
  msaa: number;
  get interpolation(): string;
  set interpolation(value: EmbindString);
}

export interface GeneralConfig extends ClassHandle {
  swapChain: SwapChainConfig;
  transparency: TransparencyConfig;
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

export interface TransparencyState extends ClassHandle {
  transparentBackground: KayoJSVCString;
}

export interface GeneralState extends ClassHandle {
  swapChain: SwapChainState;
  transparency: TransparencyState;
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

interface EmbindModule {
  KayoJSVCNumber: {};
  KayoJSVCString: {};
  KayoWASMModule: {};
  KayoWASMInstance: {
    new(): KayoWASMInstance;
  };
  RenderStatesMap: {};
  ProjectConfig: {};
  SwapChainConfig: {};
  TransparencyConfig: {};
  AntialiasingConfig: {};
  GeneralConfig: {};
  SpecificRendererConfig: {};
  RealtimeConfig: {};
  RenderConfig: {};
  SwapChainState: {};
  AntialiasingState: {};
  TransparencyState: {};
  GeneralState: {};
  SpecificRendererState: {};
  RealtimeState: {};
  RenderState: {};
  KayoR3Object: {};
  KayoWASMMinecraftModule: {
    new(_0: KayoWASMInstance): KayoWASMMinecraftModule;
  };
  KayoWASMMinecraftWorld: {};
  KayoWASMMinecraftDimension: {};
  KayoNumber: {
    fromDouble(_0: number): string;
    fromBytes(_0: EmbindString): string;
    toDouble(_0: EmbindString): number;
    toString(_0: EmbindString): string;
  };
}

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
