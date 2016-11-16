#version 100
precision lowp float;
attribute vec3 aPosition;

uniform vec3 uScale;
uniform vec3 uScaleBig;
uniform mat4 uProjection;
uniform lowp mat4 uView;
uniform mat4 uModel;

void main() {
  if (dot(aPosition, aPosition) >= 9.5) {
    gl_Position = uProjection * uView * uModel * vec4(aPosition * uScaleBig
      / 10.0, 1.0);
  } else {
    gl_Position = uProjection * uView * uModel * vec4(aPosition * uScale, 1.0);
  }
}
