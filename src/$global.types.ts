declare type Dictionary<T> = Record<string, T>;
declare type Undef<T> = T | undefined;

declare type IfDef<T, TDef, TUndef = undefined> = T extends undefined
  ? TUndef
  : TDef;

type Identity<T> = T;
type UnknownDictAoArr = Dictionary<unknown> | Array<unknown>;
declare type Flatten<T extends UnknownDictAoArr> = Identity<
  {
    [k in keyof T]: T[k] extends UnknownDictAoArr ? Flatten<T[k]> : T[k];
  }
>;


declare type UnionToIntersection<Union> = (
  // `extends unknown` is always going to be the case and is used to convert the
  // `Union` into a [distributive conditional
  // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
  Union extends unknown
    ? // The union type is used as the only argument to a function since the union
      // of function arguments is an intersection.
      (distributedUnion: Union) => void
    : // This won't happen.
      never
      // Infer the `Intersection` type since TypeScript represents the positional
      // arguments of unions of functions as an intersection of the union.
) extends (mergedIntersection: infer Intersection) => void
  ? Intersection
  : never;
