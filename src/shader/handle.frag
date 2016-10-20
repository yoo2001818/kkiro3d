#version 100

uniform lowp vec4 uColor;

uniform lowp float uRadius;

void main() {
  lowp vec2 center = (gl_PointCoord - vec2(0.5, 0.5)) * 2.0;
  lowp float dist = length(center);
  bool doOut = false;
  if (dist < 1.0) {
    gl_FragColor = uColor;
    doOut = true;
  }
  if (!doOut) discard;
}
