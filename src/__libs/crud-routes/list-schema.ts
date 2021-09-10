import {
  TArray,
  TNumber,
  TObject,
  TPartial,
  TSchema,
  TStringEnum,
  Type,
} from "@libs/typebox";

function ListSchema<TItemSchema extends TSchema>(
  itemSchema: TItemSchema
): TListSchema<TItemSchema> {
  return Type.Object({
    skip: Type.Number(),
    pageSize: Type.Number(),
    list: Type.Array(itemSchema),
  });
}

function PagingSchema(): TPagingSchema {
  return Type.Partial(
    Type.Object({
      $skip: Type.Number(),
      $pageSize: Type.Number(),
    })
  );
}

export type SortOrder = "asc" | "desc";

function SortingSchema<TSortKeys extends string>(
  sortKeys: TSortKeys[]
): TSortingSchema<TSortKeys> {
  const order = Type.StringEnum(["asc", "desc"]);
  const key = Type.StringEnum(sortKeys);
  return Type.Partial(Type.Object({ $sortKey: key, $sortOrder: order }));
}

export const TypeExt = {
  ListSchema,
  PagingSchema,
  SortingSchema,
};

export type TListSchema<TItemSchema extends TSchema> = TObject<{
  skip: TNumber;
  pageSize: TNumber;
  list: TArray<TItemSchema>;
}>;

export type TPagingSchema = TObject<
  TPartial<{
    $skip: TNumber;
    $pageSize: TNumber;
  }>
>;

export type TSortingSchema<TSortKeys extends string> = TObject<
  TPartial<{
    $sortKey: TStringEnum<TSortKeys>;
    $sortOrder: TStringEnum<SortOrder>;
  }>
>;
