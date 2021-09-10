import { TProperties, TObject, Type } from "@sinclair/typebox";
import { RouteOptions } from "fastify/types/route";
import { checkFastifyRoute, PStatic, ResolveInsertModel } from "../utils";

export type InsertRouteOptions<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>
> = {
  prefix: string;
  itemSchema: TObject<TItemProps>;
  insertSchema?: IfDef<TInsertProps, TObject<Exclude<TInsertProps, undefined>>>;
  handler: (
    insertData: ResolveInsertModel<TItemProps, TInsertProps>
  ) => Promise<PStatic<TItemProps>>;
};

export function createInsertRoute<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>
>({
  prefix,
  itemSchema,
  insertSchema,
  handler,
}: InsertRouteOptions<TItemProps, TInsertProps>): RouteOptions {
  return checkFastifyRoute<{
    Body: ResolveInsertModel<TItemProps, TInsertProps>;
  }>({
    method: "POST",
    url: prefix,
    schema: {
      body: insertSchema ?? Type.Omit(itemSchema, ["id"]),
      response: {
        200: itemSchema,
      },
    },
    handler: async ({ body }, reply) => {
      const inserted = await handler(body);
      reply.send(inserted);
    },
  });
}
