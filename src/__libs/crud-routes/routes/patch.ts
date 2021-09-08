import { Result } from "@libs/result";
import { R404 } from "@libs/shared-schemas";
import { TProperties, TObject, Type } from "@sinclair/typebox";
import { RouteOptions } from "fastify/types/route";
import {
  checkFastifyRoute,
  ErrorExt,
  PStatic,
  ResolvePatchModel,
} from "../utils";

type PatchRouteOptions<
  TItemProps extends TProperties,
  TPatchProps extends Undef<TProperties>
> = {
  prefix: string;
  itemSchema: TObject<TItemProps>;
  patchSchema?: IfDef<TPatchProps, TObject<Exclude<TPatchProps, undefined>>>;
  handler: (
    id: string,
    patchData: ResolvePatchModel<TItemProps, TPatchProps>
  ) => Promise<Result<PStatic<TItemProps>, ErrorExt<R404>>>;
};

export function createPatchRoute<
  TItemProps extends TProperties,
  TPatchProps extends Undef<TProperties>
>({
  prefix,
  itemSchema,
  patchSchema,
  handler,
}: PatchRouteOptions<TItemProps, TPatchProps>): RouteOptions {
  return checkFastifyRoute<{
    Body: ResolvePatchModel<TItemProps, TPatchProps>;
    Params: { id: string };
  }>({
    method: "PATCH",
    url: `${prefix}/:id`,
    schema: {
      body: patchSchema ?? Type.Omit(Type.Partial(itemSchema), ["id"]),
      response: {
        200: itemSchema,
        404: R404,
      },
    },
    handler: async ({ body, params }, reply) => {
      const itemId = params.id;
      const result = await handler(itemId, body);
      if (result.ok) {
        reply.send(result.value);
        return;
      }
      reply.code(404);
      reply.send(result.error.toObject?.() ?? result.error);
    },
  });
}
