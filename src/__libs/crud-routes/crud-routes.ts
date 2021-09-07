import { Result } from "@libs/result";
import { R404 } from "@libs/shared-schemas";
import { TProperties, TObject } from "@sinclair/typebox";
import { RouteOptions } from "fastify";
import { PStatic, ErrorExt, ResolveInsertModel } from "./utils";
import { createGetRoute } from "./routes/get";
import { createInsertRoute } from "./routes/insert";

interface CrudSchemas<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>
> {
  item: TObject<TItemProps>;
  insert?: IfDef<TInsertProps, TObject<Exclude<TInsertProps, undefined>>>;
}

interface CrudHandlers<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>
> {
  get(id: string): Promise<Result<PStatic<TItemProps>, ErrorExt<R404>>>;
  insert(
    insertData: ResolveInsertModel<TItemProps, TInsertProps>
  ): Promise<PStatic<TItemProps>>;
}

interface CrudRouteOptions<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>
> {
  prefix: string;
  schemas: CrudSchemas<TItemProps, TInsertProps>;
  handlers: CrudHandlers<TItemProps, TInsertProps>;
}

export function crudRoutes<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties> = undefined
>({
  prefix,
  schemas,
  handlers,
}: CrudRouteOptions<TItemProps, TInsertProps>): RouteOptions[] {
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
  ];
}
