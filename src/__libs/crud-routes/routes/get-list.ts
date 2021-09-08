import type { RouteOptions } from "fastify/types/route";
import { TObject, TProperties, Type } from "@sinclair/typebox";
import { PStatic, checkFastifyRoute } from "../utils";

type GetListRouteOptions<TItemProps extends TProperties> = {
  prefix: string;
  itemSchema: TObject<TItemProps>;
  handler: () => Promise<Array<PStatic<TItemProps>>>;
};

export function createGetListRoute<TItemProps extends TProperties>({
  prefix,
  itemSchema,
  handler,
}: GetListRouteOptions<TItemProps>): RouteOptions {
  return checkFastifyRoute<{ Params: { id: string } }>({
    method: "GET",
    url: prefix,
    schema: {
      response: {
        200: Type.Array(itemSchema),
      },
    },
    handler: async ({}, reply) => {
      const list = await handler();
      reply.send(list);
    },
  });
}
