import { Result } from "@libs/result";
import { CompareFn, compareItems } from "./compare";
import { ItemNotFoundError } from "./errors";
import { BaseItem, extractId } from "./id";
import { getPage } from "./paging";

type BoundStore<
  TItem extends BaseItem,
  TPaging extends Undef<PagingOptions>,
  TFilter
> = Omit<SimpleStore<TItem, TPaging, TFilter>, "bind">;

type ItemMatchFn<TItem extends BaseItem, TFilter> = (
  item: TItem,
  filter: TFilter
) => boolean;


type GetListOptions<TPaging extends Undef<PagingOptions>, TFilter> = {
  filter: TFilter;
  sort?: { $sortKey?: string; $sortOrder?: "asc" | "desc" };
  paging: IfDef<TPaging, { $skip?: number; $pageSize?: number }, void>;
};

type PagingOptions = {
  defaultPageSize: number;
};

type SimpleStoreOptions<
  TItem extends BaseItem,
  TPaging extends Undef<PagingOptions>,
  TFilter
> = {
  entityName: string;
  match?: ItemMatchFn<TItem, TFilter>;
  paging?: TPaging;
  compare?: CompareFn<TItem>;
};

export class SimpleStore<
  TItem extends BaseItem,
  TPaging extends Undef<PagingOptions> = undefined,
  TFilter = {}
> {
  private _entityName: string;
  private _match: ItemMatchFn<TItem, TFilter>;
  private _compare: CompareFn<TItem>;
  private _defaultPageSize: Undef<number>;
  private _map = new Map<string, TItem>();

  constructor({
    entityName,
    match,
    compare,
    paging,
  }: SimpleStoreOptions<TItem, TPaging, TFilter>) {
    this._entityName = entityName;
    this._match = match ?? (() => true);
    this._compare = compare ?? (() => undefined);
    this._defaultPageSize = paging?.defaultPageSize;
  }

  async insert(itemData: Omit<TItem, "id">): Promise<TItem> {
    const id = extractId(itemData);
    const item = {
      ...itemData,
      id,
    } as TItem;
    this._map.set(id, item);
    return item;
  }

  async getList({
    filter,
    paging,
    sort,
  }: GetListOptions<TPaging, TFilter>): Promise<TItem[]> {
    console.log("===============================================");
    console.log(arguments);
    console.log("===============================================");
    const filtered = Array.from(this._map.values()).filter((item) =>
      this._match(item, filter)
    );
    const sortKey = sort?.$sortKey;
    const sortOrder = sort?.$sortOrder ?? "asc";
    const sortOrderCorrection = sortOrder === "desc" ? -1 : 1;
    const sorted =
      sortKey === undefined
        ? filtered
        : filtered.sort((left, right) => {
            const temp =
              this._compare(sortKey, left, right) ??
              compareItems(sortKey, left, right);
            const result =
              typeof temp === "string" ? compareItems(temp, left, right) : temp;
            return result * sortOrderCorrection;
          });
    const paged =
      this._defaultPageSize == null
        ? sorted
        : getPage(
            sorted,
            paging?.$skip ?? 0,
            paging?.$pageSize ?? this._defaultPageSize
          );
    return paged;
  }

  async get(itemId: string): Promise<Result<TItem, ItemNotFoundError>> {
    const item = this._map.get(itemId);
    return item !== undefined
      ? Result.ok(item)
      : Result.error(new ItemNotFoundError(this._entityName, itemId));
  }

  async patch(
    itemId: string,
    data: Partial<Omit<TItem, "id">>
  ): Promise<Result<TItem, ItemNotFoundError>> {
    const itemResult = await this.get(itemId);
    if (!itemResult.ok) {
      return itemResult;
    }
    const item = itemResult.value;
    const updatedItem = Object.assign({}, item, data);
    this._map.set(itemId, updatedItem);
    return Result.ok(updatedItem);
  }

  async delete(itemId: string): Promise<Result<void, ItemNotFoundError>> {
    const itemResult = await this.get(itemId);
    if (!itemResult.ok) {
      return itemResult;
    }
    this._map.delete(itemId);
    return Result.ok();
  }

  bind(): BoundStore<TItem, TPaging, TFilter> {
    return {
      insert: this.insert.bind(this),
      getList: this.getList.bind(this),
      get: this.get.bind(this),
      patch: this.patch.bind(this),
      delete: this.delete.bind(this),
    };
  }
}
