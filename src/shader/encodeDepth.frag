#version 100
precision lowp float;
uniform vec2 uRange;

vec4 encodeFloatToRGBA(float v) {
  vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
  enc = fract(enc);
  enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
  return enc;
}

void main(void) {
  gl_FragColor = encodeFloatToRGBA(gl_FragCoord.z);
}
