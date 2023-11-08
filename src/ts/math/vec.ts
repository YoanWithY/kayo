import vec2 from "./vec2";
import vec3 from "./vec3";
import vec4 from "./vec4";

export default interface vec<T> {
    add(a: T): T;
}