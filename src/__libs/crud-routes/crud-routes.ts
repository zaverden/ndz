import { Result } from "@libs/result";
import { R404 } from "@libs/shared-schemas";
import { TProperties, TObject } from "@sinclair/typebox";
import { RouteOptions } from "fastify";
import {
  PStatic,
  ErrorExt,
  ResolveInsertModel,
  ResolvePatchModel,
} from "./utils";
import { createGetRoute } from "./routes/get";
import { createInsertRoute } from "./routes/insert";
import { createPatchRoute } from "./routes/patch";
import { createDeleteRoute } from "./routes/delete";

interface CrudSchemas<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>,
  TPatchProps extends Undef<TProperties>
> {
  item: TObject<TItemProps>;
  insert?: IfDef<TInsertProps, TObject<Exclude<TInsertProps, undefined>>>;
  patch?: IfDef<TPatchProps, TObject<Exclude<TPatchProps, undefined>>>;
}

interface CrudHandlers<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>,
  TPatchProps extends Undef<TProperties>
> {
  get(id: string): Promise<Result<PStatic<TItemProps>, ErrorExt<R404>>>;
  insert(
    insertData: ResolveInsertModel<TItemProps, TInsertProps>
  ): Promise<PStatic<TItemProps>>;
  patch(
    id: string,
    patchData: ResolvePatchModel<TItemProps, TPatchProps>
  ): Promise<Result<PStatic<TItemProps>, ErrorExt<R404>>>;
  delete(id: string): Promise<Result<void, ErrorExt<R404>>>;
}

interface CrudRouteOptions<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>,
  TPatchProps extends Undef<TProperties>
> {
  prefix: string;
  schemas: CrudSchemas<TItemProps, TInsertProps, TPatchProps>;
  handlers: CrudHandlers<TItemProps, TInsertProps, TPatchProps>;
}

export function crudRoutes<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties> = undefined,
  TPatchProps extends Undef<TProperties> = undefined
>({
  prefix,
  schemas,
  handlers,
}: CrudRouteOptions<TItemProps, TInsertProps, TPatchProps>): RouteOptions[] {
  return [
    createGetRoute({
      prefix,
      itemSchema: schemas.item,
      handler: handlers.get,
    }),
    createInsertRoute({
      prefix,
      itemSchema: schemas.item,
      handler: handlers.insert,
    }),
    createPatchRoute({
      prefix,
      itemSchema: schemas.item,
      handler: handlers.patch,
    }),
    createDeleteRoute({
      prefix,
      handler: handlers.delete,
    }),
  ];
}
