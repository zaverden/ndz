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
