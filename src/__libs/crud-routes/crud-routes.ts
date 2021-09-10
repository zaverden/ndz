import { TProperties, TObject } from "@sinclair/typebox";
import { RouteOptions } from "fastify";
import { createGetRoute, GetRouteOptions } from "./routes/get";
import { createInsertRoute, InsertRouteOptions } from "./routes/insert";
import { createPatchRoute, PatchRouteOptions } from "./routes/patch";
import { createDeleteRoute, DeleteRouteOptions } from "./routes/delete";
import { createGetListRoute, GetListRouteOptions } from "./routes/get-list";

interface CrudSchemas<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>,
  TPatchProps extends Undef<TProperties>,
  TFilterProps extends Undef<TProperties>
> {
  item: TObject<TItemProps>;
  insert?: IfDef<TInsertProps, TObject<Exclude<TInsertProps, undefined>>>;
  patch?: IfDef<TPatchProps, TObject<Exclude<TPatchProps, undefined>>>;
  filter?: IfDef<TFilterProps, TObject<Exclude<TFilterProps, undefined>>>;
}

interface CrudHandlers<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>,
  TPatchProps extends Undef<TProperties>,
  TFilterProps extends Undef<TProperties>,
  TWithPaging extends boolean,
  TSortKeys extends string = string
> {
  getList: GetListRouteOptions<
    TItemProps,
    TFilterProps,
    TWithPaging,
    TSortKeys
  >["handler"];

  get: GetRouteOptions<TItemProps>["handler"];
  insert: InsertRouteOptions<TItemProps, TInsertProps>["handler"];
  patch: PatchRouteOptions<TItemProps, TPatchProps>["handler"];
  delete: DeleteRouteOptions["handler"];
}

interface CrudRouteOptions<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties>,
  TPatchProps extends Undef<TProperties>,
  TFilterProps extends Undef<TProperties>,
  TWithPaging extends boolean,
  TSortKeys extends string = string
> {
  prefix: string;
  schemas: CrudSchemas<TItemProps, TInsertProps, TPatchProps, TFilterProps>;
  handlers: CrudHandlers<
    TItemProps,
    TInsertProps,
    TPatchProps,
    TFilterProps,
    TWithPaging,
    TSortKeys
  >;
  withPaging: TWithPaging;
  sortKeys: TSortKeys[];
}

export function crudRoutes<
  TItemProps extends TProperties,
  TInsertProps extends Undef<TProperties> = undefined,
  TPatchProps extends Undef<TProperties> = undefined,
  TFilterProps extends Undef<TProperties> = undefined,
  TWithPaging extends boolean = true,
  TSortKeys extends string = string
>({
  prefix,
  schemas,
  handlers,
  sortKeys,
  withPaging,
}: CrudRouteOptions<
  TItemProps,
  TInsertProps,
  TPatchProps,
  TFilterProps,
  TWithPaging,
  TSortKeys
>): RouteOptions[] {
  return [
    createGetListRoute({
      prefix,
      sortKeys,
      withPaging,
      itemSchema: schemas.item,
      filterSchema: schemas.filter,
      handler: handlers.getList,
    }),
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
