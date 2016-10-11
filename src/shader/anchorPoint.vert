#version 100

attribute vec2 aPosition;

uniform mat4 uProjectionView;
uniform mat4 uModel;
uniform vec2 uResolution;
uniform float uCrossSize;

void main(void) {
  vec4 pos = uProjectionView * uModel * vec4(aPosition, 0.0, 1.0);
  gl_Position = vec4(
    (floor(pos.xy / pos.w / uResolution) + vec2(0.5, 0.5)) * uResolution,
    -1.0, sign(pos.w));
  gl_PointSize = uCrossSize;
}
