export const shortName = name => name
  .replace('Tomatoes, raw', 'Tomatoes')
  .replace('Beans, green', 'Green beans')
  .replace('Bok Choi', 'Bok choi');

export function mgkg(value) {
  return value < 0.01 ? value.toFixed(3) : value < 0.1 ? value.toFixed(3).replace(/0$/, '') : String(value);
}
