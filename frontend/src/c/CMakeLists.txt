cmake_minimum_required(VERSION 3.13)
project(KayoWASM LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXECUTABLE_SUFFIX ".js")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})

# Gather sources
file(GLOB_RECURSE KAYO_CORE_SRC_FILES CONFIGURE_DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp)

# Create executable
add_executable(KayoCorePP ${KAYO_CORE_SRC_FILES})

# Compile‑time flags
target_compile_options(KayoCorePP PRIVATE
  -Wall
  -Wextra
  -pedantic
  -Wconversion
  -Wsign-conversion
  -Wshadow
  -Wuninitialized
  -Wunreachable-code
  -Wnull-dereference
  -Wold-style-cast
  -Woverloaded-virtual
  -O0
  -gsource-map
  -pthread   
)

# Link‑time flags (moved here)
target_link_options(KayoCorePP PRIVATE
  -sWASM_BIGINT
  --no-entry
  -sNO_DISABLE_EXCEPTION_CATCHING
  -sMODULARIZE=1
  -sEXPORT_ES6=1
  -sEXPORT_NAME="KayoWASM"
  -sENVIRONMENT=web,worker
  -sALLOW_MEMORY_GROWTH
  -pthread
  -sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency
  -sEXPORTED_RUNTIME_METHODS=HEAP8,HEAP16,HEAP32,HEAPU8,HEAPU16,HEAPU32
  --emit-tsd KayoCorePP.d.ts
  -O3
  -gsource-map
  --js-library ${CMAKE_CURRENT_SOURCE_DIR}/src/libKayo.js
)

# Link static zlib and embind
target_link_libraries(KayoCorePP PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/src/libz.a
  embind
)
