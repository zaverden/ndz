export type ParamsFromPath<S extends string> = string extends S
  ? Record<string, string>
  : S extends `${infer _prefix}/:${infer Param}/${infer Rest}`
  ? $.Merge<ParseSingleParam<Param> & ParamsFromPath<`/${Rest}`>>
  : S extends `${infer _prefix}/:${infer Param}`
  ? ParseSingleParam<Param>
  : {};

type ParseSingleParam<S extends string> = string extends S
  ? Record<string, string>
  : { [K in S]: string };
