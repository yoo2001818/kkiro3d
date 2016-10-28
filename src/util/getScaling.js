export default function getScaling(out, mat) {
  // Copied from gl-matrix, as current version on npm doesn't support
  // mat4.getScaling function yet.
  var m11 = mat[0],
    m12 = mat[1],
    m13 = mat[2],
    m21 = mat[4],
    m22 = mat[5],
    m23 = mat[6],
    m31 = mat[8],
    m32 = mat[9],
    m33 = mat[10];

  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}
