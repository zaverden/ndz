export function getPage<T>(items: T[], skip: number, pageSize: number): T[] {
  return items.slice(skip, skip + pageSize);
}
