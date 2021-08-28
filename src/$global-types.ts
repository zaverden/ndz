declare namespace $ {
  type Merge<Intersection, KeyTypes = string> = Intersection extends (
    ...a: unknown[]
  ) => unknown
    ? Intersection
    : Intersection extends new (...a: unknown[]) => unknown
    ? Intersection
    : Intersection extends object
    ? {
        [Key in keyof Intersection as Key extends KeyTypes
          ? Key
          : never]: Merge<Intersection[Key]>;
      }
    : Intersection;

  type OneLevelMerge<Intersection, KeyTypes = string> = Intersection extends (
    ...a: unknown[]
  ) => unknown
    ? Intersection
    : Intersection extends new (...a: unknown[]) => unknown
    ? Intersection
    : Intersection extends object
    ? {
        [Key in keyof Intersection as Key extends KeyTypes
          ? Key
          : never]: Intersection[Key];
      }
    : Intersection;

  type Equals<A, B> = (<X>() => X extends A ? 1 : 2) extends <
    X
  >() => X extends B ? 1 : 2
    ? unknown
    : never;

  type Assert<
    Actual,
    Expected extends
      | Equals<Actual, Expected>
      | Mistake<"Got unexpected type", { actual: Actual }>
  > = Actual;
  type AssertNever<Actual extends never> = Actual;

  const MistakeSymbol: unique symbol;
  type Mistake<Message extends string, Info = never> = {
    msg: Message;
    [MistakeSymbol]: Info;
  };
}

declare type Dictionary<T = unknown> = Record<string, T>;
declare type StringKeys<T> = Exclude<keyof T, number | symbol>;
