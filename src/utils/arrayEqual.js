export default function arrayEquals(array1, array2) {
  return array1 == array2 || ( Array.isArray(array1) && Array.isArray(array2) && array1.length == array2.length && array1.every( (value, index) => value == array2[index] ) );
}