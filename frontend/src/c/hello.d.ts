// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
}
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
interface EmbindModule {
  helloWorld(): void;
  openRegion(_0: EmbindString, _1: number, _2: number, _3: number, _4: EmbindString): void;
  setActiveChunk(_0: EmbindString, _1: number, _2: number, _3: number): number;
  getByte(_0: EmbindString): number;
  getShort(_0: EmbindString): number;
  getInt(_0: EmbindString): number;
  getLong(_0: EmbindString): bigint;
  getFloat(_0: EmbindString): number;
  getDouble(_0: EmbindString): number;
  getString(_0: EmbindString): string;
  getList(_0: EmbindString): string;
  getCompound(_0: EmbindString): string;
  buildChunk(_0: EmbindString, _1: number, _2: number, _3: number): number;
  getPalette(_0: number): string;
  getByteArray(_0: EmbindString): any;
  getSectionView(_0: EmbindString, _1: number, _2: number, _3: number, _4: number): any;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
