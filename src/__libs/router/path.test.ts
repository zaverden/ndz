import type { ParamsFromPath } from "./path.types";

type _TEST1 = $.Assert<ParamsFromPath<"">, {}>;
type _TEST2 = $.Assert<ParamsFromPath<"/">, {}>;
type _TEST3 = $.Assert<ParamsFromPath<"/foo">, {}>;
type _TEST4 = $.Assert<ParamsFromPath<"/:foo">, { foo: string }>;
type _TEST5 = $.Assert<
  ParamsFromPath<"/:foo/:bar">,
  { foo: string; bar: string }
>;

