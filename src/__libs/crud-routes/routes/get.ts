import type { RouteOptions } from "fastify/types/route";
import { Result } from "@libs/result";
import { R404 } from "@libs/shared-schemas";
import { TObject, TProperties } from "@sinclair/typebox";
import { PStatic, ErrorExt, checkFastifyRoute } from "../utils";

export type GetRouteOptions<TItemProps extends TProperties> = {
  prefix: string;
  itemSchema: TObject<TItemProps>;
  handler: (id: string) => Promise<Result<PStatic<TItemProps>, ErrorExt<R404>>>;
};

export function createGetRoute<TItemProps extends TProperties>({
  prefix,
  itemSchema,
  handler,
}: GetRouteOptions<TItemProps>): RouteOptions {
  return checkFastifyRoute<{ Params: { id: string } }>({
    method: "GET",
    url: `${prefix}/:id`,
    schema: {
      response: {
        200: itemSchema,
        404: R404,
      },
    },
    handler: async (req, reply) => {
      const itemId = req.params.id;
      const result = await handler(itemId);
      if (result.ok) {
        reply.send(result.value);
        return;
      }
      reply.code(404).send(result.error.toObject?.() ?? result.error);
    },
  });
}
