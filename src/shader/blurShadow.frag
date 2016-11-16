#version 100
precision lowp float;

varying lowp vec2 vTexCoord;

uniform sampler2D uTexture;
uniform lowp vec2 uTextureOffset;

lowp vec2 encodeFloatToRG(lowp float v) {
  v = min(0.99999, v);
  lowp vec2 enc = vec2(1.0, 255.0) * v;
  enc = fract(enc);
  enc -= enc.yy * vec2(1.0 / 255.0, 0.0);
  return enc;
}

lowp float decodeRGToFloat(lowp vec2 v) {
  return dot(v, vec2(1.0, 1.0 / 255.0));
}

vec2 shadowTex2D(sampler2D tex, vec2 fragCoord) {
  vec4 value = texture2D(tex, fragCoord);
  return vec2(decodeRGToFloat(value.rg), decodeRGToFloat(value.ba));
}

void main() {
  lowp vec2 tex = vTexCoord;
  lowp vec2 data;
  data = shadowTex2D(uTexture, vTexCoord);
  data += shadowTex2D(uTexture, vTexCoord + uTextureOffset * vec2(1.0, 1.0));
  data += shadowTex2D(uTexture, vTexCoord + uTextureOffset * vec2(-1.0, 1.0));
  data += shadowTex2D(uTexture, vTexCoord + uTextureOffset * vec2(1.0, -1.0));
  data += shadowTex2D(uTexture, vTexCoord + uTextureOffset * vec2(-1.0, -1.0));
  data /= 5.0;
  gl_FragColor = vec4(encodeFloatToRG(data.x), encodeFloatToRG(data.y));
}
