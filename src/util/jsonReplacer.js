function convertByteArray(value) {
  var array = [];
  for (let i = 0; i < value.length; ++i) {
    array[i] = value[i];
  }
  return array;
}

export default function jsonReplacer(key, value) {
  if (value instanceof Float32Array) {
    return convertByteArray(value);
  }
  return value;
}
