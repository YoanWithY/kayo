cmake_minimum_required(VERSION 3.13)
project(KayoWASM LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXECUTABLE_SUFFIX ".js")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR})
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR})

# Gather sources
file(GLOB_RECURSE SRC_FILES CONFIGURE_DEPENDS ${CMAKE_SOURCE_DIR}/src/*.cpp)

# Create executable
add_executable(KayoPP ${SRC_FILES})

# Compile‑time flags
target_compile_options(KayoPP PRIVATE
  -Wall
  -Wextra
  -pedantic
  -O0
)

# Link‑time flags (moved here)
target_link_options(KayoPP PRIVATE
  -sWASM_BIGINT
  --no-entry
  -sNO_DISABLE_EXCEPTION_CATCHING
  -sMODULARIZE
  -sEXPORT_ES6
  -sENVIRONMENT=web
  -sALLOW_MEMORY_GROWTH
  --emit-tsd KayoPP.d.ts
  -gsource-map
)

# Link static zlib and embind
target_link_libraries(KayoPP PRIVATE
  ${CMAKE_SOURCE_DIR}/src/libz.a
  embind
)
