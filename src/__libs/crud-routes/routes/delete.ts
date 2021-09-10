import type { RouteOptions } from "fastify/types/route";
import { Result } from "@libs/result";
import { R404 } from "@libs/shared-schemas";
import { ErrorExt, checkFastifyRoute } from "../utils";
import { Type } from "@sinclair/typebox";

export type DeleteRouteOptions = {
  prefix: string;
  handler: (id: string) => Promise<Result<void, ErrorExt<R404>>>;
};

export function createDeleteRoute({
  prefix,
  handler,
}: DeleteRouteOptions): RouteOptions {
  return checkFastifyRoute<{ Params: { id: string } }>({
    method: "DELETE",
    url: `${prefix}/:id`,
    schema: {
      response: {
        200: Type.Null(),
        404: R404,
      },
    },
    handler: async ({ params }, reply) => {
      const itemId = params.id;
      const result = await handler(itemId);
      if (result.ok) {
        reply.send(undefined);
        return;
      }
      reply.code(404).send(result.error.toObject?.() ?? result.error);
    },
  });
}
