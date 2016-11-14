#version 100
precision lowp float;

attribute vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform vec3 uSize;

vec3 getViewPosWorld() {
  return -mat3(
    uView[0].x, uView[1].x, uView[2].x,
    uView[0].y, uView[1].y, uView[2].y,
    uView[0].z, uView[1].z, uView[2].z
    ) * uView[3].xyz;
}

void main() {
  vec3 modelPos = (uModel * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 up = (uModel * vec4(0.0, 0.0, -1.0, 0.0)).xyz;
  up = normalize(up);
  vec3 dir = modelPos - getViewPosWorld();
  dir = normalize(dir);
  vec3 x = cross(up, dir);
  x = normalize(x);
  vec3 y = cross(up, x);
  y = normalize(y);
  mat4 mat = mat4(
    vec4(x, 0.0),
    vec4(y, 0.0),
    vec4(up, 0.0),
    vec4(modelPos, 1.0)
  );
  float lineLength = uSize.x;
  float radius = length(aPosition.yz);
  if (radius > 1.5) radius = uSize.z / 2.0;
  else radius = uSize.y;
  vec3 position = aPosition * vec3(1.0, radius, radius) * lineLength;
  position = position.yzx;
  gl_Position = uProjection * uView * mat * vec4(position, 1.0);
}
