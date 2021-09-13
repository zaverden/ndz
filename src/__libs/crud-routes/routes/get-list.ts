import type { RouteOptions } from "fastify/types/route";
import { Static, TObject, TProperties, Type } from "@libs/typebox";
import { PStatic, checkFastifyRoute, ResolveFilterModel } from "../utils";
import { TPagingSchema, TSortingSchema, TypeExt } from "../list-schema";

type GetListQueryModel<TSortKeys extends string> = Static<TPagingSchema> &
  Static<TSortingSchema<TSortKeys>>;

export type GetListHandlerOptions<
  TFilterProps extends Undef<TProperties>,
  TWithPaging extends boolean,
  TSortKeys extends string
> = {
  filter: ResolveFilterModel<TFilterProps>;
  sort: Static<TSortingSchema<TSortKeys>>;
  paging: If<TWithPaging, Static<TPagingSchema>, void>;
};

export type GetListRouteOptions<
  TItemProps extends TProperties,
  TFilterProps extends Undef<TProperties>,
  TWithPaging extends boolean,
  TSortKeys extends string
> = {
  prefix: string;
  itemSchema: TObject<TItemProps>;
  withPaging: TWithPaging;
  sortKeys: TSortKeys[];
  filterSchema?: IfDef<TFilterProps, TObject<Exclude<TFilterProps, undefined>>>;
  handler: (
    options: GetListHandlerOptions<TFilterProps, TWithPaging, TSortKeys>
  ) => Promise<Array<PStatic<TItemProps>>>;
};

export function createGetListRoute<
  TItemProps extends TProperties,
  TFilterProps extends Undef<TProperties>,
  TWithPaging extends boolean,
  TSortKeys extends string
>({
  prefix,
  itemSchema,
  withPaging,
  sortKeys,
  filterSchema,
  handler,
}: GetListRouteOptions<
  TItemProps,
  TFilterProps,
  TWithPaging,
  TSortKeys
>): RouteOptions {
  const pagingSchema = withPaging ? TypeExt.PagingSchema() : Type.EmptyObject();
  const listSchema = TypeExt.ListSchema(itemSchema);
  const querySchema = Type.Merge([
    pagingSchema,
    sortKeys?.length > 0 ? TypeExt.SortingSchema(sortKeys) : Type.EmptyObject(),
    filterSchema ?? Type.EmptyObject({ additionalProperties: false }),
  ]);

  return checkFastifyRoute<{
    Params: { id: string };
    Querystring: GetListQueryModel<TSortKeys>;
  }>({
    method: "GET",
    url: prefix,
    schema: {
      querystring: querySchema,
      response: {
        200: listSchema,
      },
    },
    handler: async ({ query }, reply) => {
      const { $skip, $pageSize, $sortKey, $sortOrder, ...filter } = query;
      const list = await handler({
        filter: filter as ResolveFilterModel<TFilterProps>,
        sort: { $sortKey, $sortOrder },
        paging: (withPaging ? { $skip, $pageSize } : undefined) as If<
          TWithPaging,
          Static<TPagingSchema>,
          void
        >,
      });
      reply.send({
        list,
        skip: $skip ?? 0,
        pageSize: $pageSize ?? 20,
      });
    },
  });
}
