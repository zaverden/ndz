import { Static, TObject, TProperties } from "@sinclair/typebox";
import { RouteGenericInterface, RouteOptions } from "fastify/types/route";
import { FastifySchema } from "fastify/types/schema";
import {
  ContextConfigDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from "fastify/types/utils";

export type PStatic<TProps extends TProperties> = Flatten<Static<TObject<TProps>>>;
export type ErrorExt<T> = Error & T & { toObject?: () => Error & T };

export function checkFastifyRoute<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  ContextConfig = ContextConfigDefault,
  SchemaCompiler = FastifySchema
>(
  options: RouteOptions<
    RawServer,
    RawRequest,
    RawReply,
    RouteGeneric,
    ContextConfig,
    SchemaCompiler
  >
) {
  return options as unknown as RouteOptions;
}

export type ResolveInsertModel<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>
> = IfDef<
  TInsertProps,
  PStatic<Exclude<TInsertProps, undefined>>,
  PStatic<Omit<TItemProps, "id">>
>;