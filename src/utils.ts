export function mapcoord([x, y]: [number, number]): [number, number] {
  const NewX = y / -64 - 0.5;
  const NewY = x / 64;
  return [NewX, NewY];
}
export function worldcoord([x, y]: [number, number]): [number, number] {
  const NewX = y * 64;
  const NewY = (x + 0.5) * -64;
  return [NewX, NewY];
}
