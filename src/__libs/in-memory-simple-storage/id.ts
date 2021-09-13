export type BaseItem = { id: string };

let nextId = 1000000000000000000n;
function createSimpleId() {
  return (++nextId).toString();
}

export function extractId(data: Dictionary<unknown>): string {
  if (typeof data.id === "string") {
    return data.id;
  }
  return createSimpleId();
}
