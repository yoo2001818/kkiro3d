import { quat, vec3 } from 'gl-matrix';

export default function lookAt(out, front, up) {
  let zFront = vec3.create();
  vec3.normalize(zFront, front);
  let right = vec3.create();
  vec3.cross(right, up, zFront);
  vec3.normalize(right, right);
  if (vec3.length(right) < 0.0001) {
    right = [1, 0, 0];
  }
  let yUp = vec3.create();
  vec3.cross(yUp, zFront, right);
  let mat = [
    right[0], right[1], right[2],
    yUp[0], yUp[1], yUp[2],
    zFront[0], zFront[1], zFront[2]
  ];
  return quat.fromMat3(out, mat);
}
