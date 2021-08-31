import {
  Static,
  TObject,
  TKeyOf,
  TValue,
  TLiteral,
  TEnum,
  TString,
  TSchema,
  TNumber,
  TInteger,
  TBoolean,
  TProperties,
} from "@sinclair/typebox";
import { ParamsFromPath } from "./path.types";

export type Operation = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RoutePlaceholder {
  operation: string;
  path: string;
  schemes: {
    params?: TParams<string> | undefined;
    body?: TBody | undefined;
    query?: TQuery | undefined;
    headers?: THeaders | undefined;
  };
  handler(p: {
    params?: Static<TParams<string>> | undefined;
    body?: Static<TBody> | undefined;
    query?: Static<TQuery> | undefined;
    headers?: Static<THeaders> | undefined;
  }): void;
}

export interface RouteDefinition<
  TOp extends Operation,
  TPath extends string,
  TParamsSchema extends TParams<TPath> | undefined = undefined,
  TBodySchema extends TBody | undefined = undefined,
  THeadersSchema extends THeaders | undefined = undefined,
  TQuerySchema extends TQuery | undefined = undefined
> {
  operation: TOp;
  path: TPath;
  schemes: $.Merge<
    (keyof ParamsFromPath<TPath> extends never
      ? {}
      : {
          params: NoExtraFields<
            Exclude<TParamsSchema, undefined>,
            StringKeys<ParamsFromPath<TPath>>
          >;
        }) &
      (TOp extends "GET"
        ? {
            body?: TBodySchema;
          }
        : {}) & {
        query?: TQuerySchema;
        headers?: THeadersSchema;
      },
    "one-level"
  >;
  handler: (p: {
    params: undefined extends TParamsSchema ? never : Static<TParamsSchema>;
    body: undefined extends TBodySchema ? never : Static<TBodySchema>;
    query: undefined extends TQuerySchema ? never : Static<TQuerySchema>;
    headers: undefined extends THeadersSchema ? never : Static<THeadersSchema>;
  }) => unknown;
}

export type TParams<TPath extends string> = MapRouteParamsToSchema<TPath>;
export type TBody = TSchema;
export type TQuery = TObject<TProperties>;
export type THeaders = TObject<Dictionary<TSchemaPrimitive>>;

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

type NoExtraFields<
  TObjectScheme extends TObject<Dictionary<TSchemaPrimitive>>,
  TValidKeys extends string
> = Exclude<keyof TObjectScheme["properties"], TValidKeys> extends never
  ? TObjectScheme
  : $.Mistake<
      "Contains extra keys",
      { extraKeys: Exclude<keyof TObjectScheme["properties"], TValidKeys> }
    >;
