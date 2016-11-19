#version 100
precision lowp float;
attribute vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform float uBias;

void main() {
  vec4 pos = (uProjection * uView * uModel * vec4(aPosition, 1.0));
  pos.z -= uBias;
  gl_Position = pos;
}
