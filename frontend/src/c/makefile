# Source file and output base name
OUT_BASE = hello
SRC = $(OUT_BASE).cpp nbt/nbt.cpp parse/parse.cpp zlibUtil/zlibUtil.cpp zlib/libz.a

# Emscripten options
EMCC_FLAGS = --no-entry -sNO_DISABLE_EXCEPTION_CATCHING -s MODULARIZE -s EXPORT_ES6 -s ENVIRONMENT=web -sALLOW_MEMORY_GROWTH -lembind --emit-tsd $(OUT_BASE).d.ts

# Rule for generating both the WebAssembly JS module and the .d.ts file
$(OUT_BASE).js: $(SRC)
	emcc $(SRC) -o $(OUT_BASE).js $(EMCC_FLAGS)

# Clean up generated files
clean:
	rm -f $(OUT_BASE).js $(OUT_BASE).d.ts $(OUT_BASE).wasm

.PHONY: clean