import mat4 from "./mat4";

export function toDEG(RAD: number) {
    return RAD * 57.295779513082320876798154814105;
}

export function toRAD(DEG: number) {
    return DEG * 0.01745329251994329576923690768489;
}

export function modulo(a: number, b: number) {
    return (a % b + b) % b;
}

export function perspective(vFOV: number, AR: number, n: number, f: number): mat4 {
    const t = Math.tan(vFOV / 2) * n;
    const t2 = t * 2;
    const r = t * AR;
    const r2 = r * 2;
    const d = f - n;
    const n2 = 2 * n;

    return new mat4(
        n2 / r2, 0, 0, 0,
        0, n2 / t2, 0, 0,
        0, 0, -(f + n) / d, -n2 * f / d,
        0, 0, -1, 0);
}

export function nCr(n: number, r: number) {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;

    let result = 1;
    r = Math.min(r, n - r);

    for (let i = 0; i < r; i++)
        result *= (n - i) / (r - i);

    return Math.round(result);
}

export function bernsteinBasisPolynomial(n: number, k: number, x: number) {
    return nCr(n, k) * (x ** k) * ((1 - x) ** (n - k));
}