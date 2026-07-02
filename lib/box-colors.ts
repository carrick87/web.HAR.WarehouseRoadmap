const BOX_COLORS = [
  "bg-rose-500 hover:bg-rose-600",
  "bg-orange-500 hover:bg-orange-600",
  "bg-amber-500 hover:bg-amber-600",
  "bg-lime-500 hover:bg-lime-600",
  "bg-emerald-500 hover:bg-emerald-600",
  "bg-teal-500 hover:bg-teal-600",
  "bg-cyan-500 hover:bg-cyan-600",
  "bg-sky-500 hover:bg-sky-600",
  "bg-indigo-500 hover:bg-indigo-600",
  "bg-violet-500 hover:bg-violet-600",
  "bg-fuchsia-500 hover:bg-fuchsia-600",
  "bg-pink-500 hover:bg-pink-600",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBoxColor(number: number, participantId: string): string {
  const index = hashString(`${number}-${participantId}`) % BOX_COLORS.length;
  return BOX_COLORS[index];
}
