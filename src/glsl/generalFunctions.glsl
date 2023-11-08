float randf(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float randf(vec3 st) {
    return fract(sin(dot(st, vec3(12.9898, 78.233, 3.1234))) * 43758.5453123);
}

float randf(ivec2 st) {
    return randf(vec2(st));
}

float randf(ivec3 st) {
    return randf(vec3(st));
}

vec2 randVec2(vec2 st) {
    return vec2(randf(st), randf(st + 1.0));
}

vec2 randVec2(ivec2 st) {
    return vec2(randf(st), randf(st + 1));
}

vec3 randVec3(vec2 st) {
    return vec3(randf(st), randf(st + 1.0), randf(st + 2.0));
}

vec3 randVec3(vec3 st) {
    return vec3(randf(st), randf(st + 1.0), randf(st + 2.0));
}

vec3 randVec3(ivec2 st) {
    return vec3(randf(st), randf(st + 1), randf(st + 2));
}

vec3 randVec3(ivec3 st) {
    return vec3(randf(st), randf(st + 1), randf(st + 2));
}

float manhattan(vec3 a, vec3 b) {
    vec3 v = abs(a - b);
    return v.x + v.y + v.z;
}

float manhattan(vec2 a, vec2 b) {
    vec2 v = abs(a - b);
    return v.x + v.y;
}

float chebyshev(vec3 a, vec3 b) {
    vec3 v = abs(a - b);
    return max(max(v.x, v.y), v.z);
}

struct Voronoi3D {
    float distance;
    vec3 color;
    ivec3 position;
};

vec3 voronoiCenter(ivec3 cell, float scale, vec3 random) {
    return (vec3(cell) + vec3(0.5) + (random * randVec3(cell))) / scale;
}

#define VORONOI_SEARCH_SIZE 1
const int voronoi3D_search_grid_size = (2 * VORONOI_SEARCH_SIZE + 1) * (2 * VORONOI_SEARCH_SIZE + 1) * (2 * VORONOI_SEARCH_SIZE + 1);

Voronoi3D getVoronoi(vec3 pos, float scale, vec3 random) {
    vec3 r = clamp(random * (float(VORONOI_SEARCH_SIZE) / 2.0), 0.0, (float(VORONOI_SEARCH_SIZE) / 2.0));
    ivec3 thisGridCell = ivec3(floor(pos * scale));
    ivec3 minCell = thisGridCell;
    float minDist = 1.0 / 0.0;

    for(int x = thisGridCell.x - VORONOI_SEARCH_SIZE; x <= thisGridCell.x + VORONOI_SEARCH_SIZE; x++) {
        for(int y = thisGridCell.y - VORONOI_SEARCH_SIZE; y <= thisGridCell.y + VORONOI_SEARCH_SIZE; y++) {
            for(int z = thisGridCell.z - VORONOI_SEARCH_SIZE; z <= thisGridCell.z + VORONOI_SEARCH_SIZE; z++) {
                ivec3 cell = ivec3(x, y, z);
                vec3 center = voronoiCenter(cell, scale, r);
                float d = distance(center, pos);
                if(d < minDist) {
                    minDist = d;
                    minCell = cell;
                }
            }
        }
    }

    return Voronoi3D(minDist * scale, randVec3(minCell), minCell);
}
