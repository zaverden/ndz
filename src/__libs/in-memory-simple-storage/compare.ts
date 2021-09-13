import { BaseItem } from "./id";

export type CompareResult = 0 | 1 | -1;
export type CompareFn<TItem extends BaseItem> = (
  sortKey: string,
  left: TItem,
  right: TItem
) => Undef<CompareResult> | string;

type BaseCompareFn<T> = (a: T, b: T) => CompareResult;

export const SimpleComparer = Object.freeze({
  number: (a: number, b: number) => compareComparable(a, b),
  bigint: (a: bigint, b: bigint) => compareComparable(a, b),
  date: (a: Date, b: Date) => compareComparable(a, b),
  boolean: (a: boolean, b: boolean): CompareResult => {
    if (a === b) return 0;
    if (a === true) return -1; // true on top
    return 1;
  },
  string: (a: string, b: string, ignoreCase = true): CompareResult => {
    return ignoreCase
      ? compareComparable(a.toUpperCase(), b.toUpperCase())
      : compareComparable(a, b);
  },
});

export function compareItems<TItem extends BaseItem & Dictionary<unknown>>(
  sortKey: string,
  left: TItem,
  right: TItem
): CompareResult {
  if (!objectHas(left, sortKey) && !objectHas(right, sortKey)) {
    return 0;
  }

  const valueLeft = left[sortKey];
  const valueRight = right[sortKey];

  //  null / null  =>  0
  // value / null  => -1 (left on top)
  //  null / value =>  1 (right on top)
  if (valueLeft == null) {
    return valueRight == null ? 0 : 1;
  } else if (valueRight == null) {
    return -1;
  }

  if (valueLeft === valueRight) return 0;
  const type = valueLeft instanceof Date ? "date" : typeof valueLeft;
  const simpleCompare = getSimpleComparer(type);
  return simpleCompare?.(left, right) ?? 0;
}

function compareComparable<T extends number | bigint | Date | string>(
  a: T,
  b: T
): CompareResult {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function getSimpleComparer<T>(type: string): Undef<BaseCompareFn<T>> {
  return (SimpleComparer as Dictionary<BaseCompareFn<unknown>>)[type];
}

function objectHas<T extends Dictionary<unknown>, TKey extends string>(
  object: T,
  key: TKey
): object is T & { [K in TKey]: unknown } {
  return Object.prototype.hasOwnProperty.call(object, key);
}
