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
  TProperties,
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
type TBody = TObject<TProperties>;
type TQuery = TObject<TProperties>;

interface RouteDefinition<
  TMethod extends HttpMethod,
  TPath extends string,
  TParamsSchema extends MapRouteParamsToSchema<TPath> | undefined = undefined,
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
            Exclude<TParamsSchema, undefined>,
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
  handler: (p: {
    params: undefined extends TParamsSchema ? never : Static<TParamsSchema>;
    body: undefined extends TBodySchema ? never : Static<TBodySchema>;
    query: undefined extends TQuerySchema ? never : Static<TQuerySchema>;
    headers: undefined extends THeadersSchema ? never : Static<THeadersSchema>;
  }) => unknown;
}

export function route<
  TMethod extends HttpMethod,
  TPath extends string,
  TParamsSchema extends MapRouteParamsToSchema<TPath> | undefined = undefined,
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
    body: paramsSchema
  },
  handler(p) {
  },
});
