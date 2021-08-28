import {
  Static,
  Type,
  TObject,
  TKeyOf,
  TValue,
  TLiteral,
  TEnum,
  TString,
  TNumber,
  TInteger,
  TBoolean,
  TSchema,
} from "@sinclair/typebox";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type TSchemaPrimitive =
  | TKeyOf<[]>
  | TLiteral<TValue>
  | TEnum<[]>
  | TString
  | TNumber
  | TInteger
  | TBoolean;

type MapRouteParamsToSchema<TPath extends string> = TObject<
  {
    [K in keyof ParamsFromPath<TPath>]: TSchemaPrimitive;
  }
>;

type THeaders = TObject<Dictionary<TSchemaPrimitive>>;
type TBody = TObject<Dictionary<TSchema>>;
type TQuery = TObject<Dictionary<TSchema>>;

interface RouteDefinition<
  TMethod extends HttpMethod,
  TPath extends string,
  TParamsSchema extends MapRouteParamsToSchema<TPath>,
  TBodySchema extends TBody | undefined = undefined,
  THeadersSchema extends THeaders | undefined = undefined,
  TQuerySchema extends TQuery | undefined = undefined
> {
  method: TMethod;
  path: TPath;
  schemes: $.OneLevelMerge<
    (keyof ParamsFromPath<TPath> extends never
      ? {}
      : {
          params: NoExtraFields<
            TParamsSchema,
            StringKeys<ParamsFromPath<TPath>>
          >;
        }) &
      (TMethod extends "GET"
        ? {
            body?: TBodySchema;
          }
        : {}) & {
        query?: TQuerySchema;
        headers?: THeadersSchema;
      }
  >;
}

export function route<
  TMethod extends HttpMethod,
  TPath extends string,
  TParamsSchema extends MapRouteParamsToSchema<TPath>,
  TBodySchema extends TBody | undefined = undefined,
  THeadersSchema extends THeaders | undefined = undefined,
  TQuerySchema extends TQuery | undefined = undefined
>(
  definition: RouteDefinition<
    TMethod,
    TPath,
    TParamsSchema,
    TBodySchema,
    THeadersSchema,
    TQuerySchema
  >
): null {
  return null;
}

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

type NoExtraFields<
  TObjectScheme extends TObject<Dictionary<TSchemaPrimitive>>,
  TValidKeys extends string
> = Exclude<keyof TObjectScheme["properties"], TValidKeys> extends never
  ? TObjectScheme
  : $.Mistake<
      "Contains extra keys",
      { extraKeys: Exclude<keyof TObjectScheme["properties"], TValidKeys> }
    >;

const paramsSchema = Type.Object({
  userId: Type.String(),
  projectId: Type.String({}),
});

route({
  method: "GET",
  path: "/users/:userId/projects/:projectId",
  schemes: {
    params: paramsSchema,
  },
});
