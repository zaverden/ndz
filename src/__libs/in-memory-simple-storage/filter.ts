import { BaseItem } from "./id";

export type ItemMatchFn<TItem extends BaseItem, TFilter> = (
  filter: TFilter,
  item: TItem
) => boolean;

export const NullOr = Object.freeze({
  eq<T>(f: Undef<T>, v: Undef<T>): boolean {
    return f == null || f === v;
  },
  contains(f: Undef<string>, v: Undef<string>, ignoreCase = true): boolean {
    if (f == null || v == null) {
      return false;
    }
    return ignoreCase
      ? v.toUpperCase().includes(f.toUpperCase())
      : v.includes(f);
  },
});
