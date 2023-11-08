struct RaymarchResult {
    vec3 position;
    vec3 normal;
    vec3 color;
};

float compmin(vec3 v) {
    return min(min(v.x, v.y), v.z);
}

float sphereSDF(float radius, vec3 p) {
    return length(p) - radius;
}

float planeSDF(vec3 n, vec3 p) {
    return dot(p, n);
}

float boxSDF(vec3 b, vec3 p) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float roundBoxSDF(vec3 b, float r, vec3 p) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float segmentSDF(float l, vec3 p) {
    p = abs(p);
    return length(vec3(max(p.x - l, 0.0), p.y, p.z));
}

float segmentSDF2D(float l, vec2 p) {
    p = abs(p);
    return length(vec2(max(p.x - l, 0.0), p.y));
}

float infinite_cross_SDF(float r, vec3 p) {
    return min(min(length(p.yz), length(p.xz)), length(p.xy)) - r;
}

float roundedCrossSDF2D(float length, float radius, vec2 p) {
    p = abs(p);
    return min(segmentSDF2D(length, p), segmentSDF2D(length, p.yx)) - radius;
}

float roundedCrossSDF(float length, float radius, vec3 p) {
    p = abs(p);
    return min(segmentSDF(length, p), segmentSDF(length, p.yxz)) - radius;
}

float torusSDF(vec2 t, vec3 p) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float crossSDF(in vec2 b, float r, in vec2 p) {
    p = abs(p);
    p = (p.y > p.x) ? p.yx : p.xy;

    vec2 q = p - b;
    float k = max(q.y, q.x);
    vec2 w = (k > 0.0) ? q : vec2(b.y - p.x, -k);

    return sign(k) * length(max(w, 0.0)) + r;
}

float smooth_min_unit(float v1, float v2, float k) {
    float d = v1 - v2;
    return (v1 + v2 - sqrt(d * d + k)) / 2.0;
}

float smooth_max_unit(float v1, float v2, float k) {
    float d = v1 - v2;
    return (v1 + v2 + sqrt(d * d + k)) / 2.0;
}

float smooth_min_polynomial_2(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float smooth_max_polynomial_2(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return max(a, b) + h * h * k * (1.0 / 4.0);
}

float smooth_min_polynomial_3(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

float smooth_max_polynomial_3(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return max(a, b) + h * h * h * k * (1.0 / 6.0);
}

float smooth_max_LogSumExp(float v1, float v2, float k) {
    return log(exp(v1 * k) + exp(v2 * k)) / k;
}

float smooth_min_LogSumExp(float v1, float v2, float k) {
    return smooth_max_LogSumExp(v1, v2, -k);
}

float mellowmax(float v1, float v2, float k) {
    return log((exp(v1 * k) + exp(v2 * k)) / 2.0) / k;
}

float mellowmax_save(float v1, float v2, float k) {
    return k != 0.0 ? log((exp(v1 * k) + exp(v2 * k)) / 2.0) / k : (v1 + v2) / 2.0;
}

float Union(float sd1, float sd2) {
    return min(sd1, sd2);
}

vec2 Union_m(float sd1, float sd2) {
    return sd1 < sd2 ? vec2(sd1, 0.0) : vec2(sd2, 1.0);
}

float Intersection(float sd1, float sd2) {
    return max(sd1, sd2);
}

float Subtraction(float sd1, float sd2) {
    return Intersection(sd1, -sd2);
}

float border(float sd, float width) {
    return Subtraction(sd, sd + width);
}

float smooth_unit_union(float sd1, float sd2, float k) {
    return smooth_min_unit(sd1, sd2, k);
}

float smooth_unit_intersection(float sd1, float sd2, float k) {
    return smooth_max_unit(sd1, sd2, k);
}

float smooth_unit_subtraction(float sd1, float sd2, float k) {
    return smooth_unit_intersection(sd1, -sd2, k);
}

float smooth_polynomial_2_union(float sd1, float sd2, float k) {
    return smooth_min_polynomial_2(sd1, sd2, k);
}

float smooth_polynomial_2_intersection(float sd1, float sd2, float k) {
    return smooth_max_polynomial_2(sd1, sd2, k);
}

float smooth_polynomial_2_subtraction(float sd1, float sd2, float k) {
    return smooth_polynomial_2_intersection(sd1, -sd2, k);
}

float smooth_polynomial_3_union(float sd1, float sd2, float k) {
    return smooth_min_polynomial_3(sd1, sd2, k);
}

float smooth_polynomial_3_intersection(float sd1, float sd2, float k) {
    return smooth_max_polynomial_3(sd1, sd2, k);
}

float smooth_polynomial_3_subtraction(float sd1, float sd2, float k) {
    return smooth_polynomial_3_intersection(sd1, -sd2, k);
}

float opExtrusion(in float sdf, in float h, in vec3 p) {
    vec2 w = vec2(sdf, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

vec3 materialSDF(vec3 pos);
float SDF(vec3 pos);

float SchlickFresnel(float f0, vec3 normal, vec3 viewDirection) {
    float cosTheta = max(dot(normal, viewDirection), 0.0);
    return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
}

const float epsilon = 0.0001;
RaymarchResult raymarch0(in vec3 camPos, in vec3 v) {
    v = normalize(v);
    vec3 p = camPos;
    float d = SDF(p);
    uint i = 0u;
    float accum = 0.0;
    while(accum < 128.0) {
        if(d < epsilon) {
            vec3 material = materialSDF(p);

            const vec2 e = vec2(0.0001, 0.0);
            vec3 normal = normalize(vec3(SDF(p + e.xyy) - SDF(p - e.xyy), SDF(p + e.yxy) - SDF(p - e.yxy), SDF(p + e.yyx) - SDF(p - e.yyx)));
            vec3 R = reflect(v, normal);
            vec3 l = normalize(vec3(1, 1, 1));
            vec3 diff = vec3(material.rgb * max(dot(l, normal), 0.1));

            return RaymarchResult(p, normal, mix(diff, world(R), SchlickFresnel(0.04, normal, -v)));
        }
        p += d * v;
        d = SDF(p);
        accum += d;
        i++;
    }
    return RaymarchResult(vec3(0.0), vec3(0.0), world(v));
}

RaymarchResult raymarch(in vec3 camPos, in vec3 v) {
    v = normalize(v);
    vec3 p = camPos;
    float d = SDF(p);
    if(d < 0.0)
        discard;
    uint i = 0u;
    float accum = 0.0;
    while(accum < 128.0) {
        if(d < epsilon) {
            vec3 material = materialSDF(p);

            const vec2 e = vec2(0.0001, 0.0);
            vec3 normal = normalize(vec3(SDF(p + e.xyy) - SDF(p - e.xyy), SDF(p + e.yxy) - SDF(p - e.yxy), SDF(p + e.yyx) - SDF(p - e.yyx)));
            vec3 R = reflect(v, normal);
            vec3 l = normalize(vec3(1, 1, 1));
            vec3 diff = vec3(material.rgb * max(dot(l, normal), 0.1));

            return RaymarchResult(p, normal, mix(diff, raymarch0(p + 2.0 * epsilon * R, R).color, SchlickFresnel(0.04, normal, -v)));
        }
        p += d * v;
        d = SDF(p);
        accum += d;
        i++;
    }
    discard;
}
