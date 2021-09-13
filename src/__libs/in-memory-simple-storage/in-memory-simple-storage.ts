import { CustomError } from "@libs/custom-error";
import { Result } from "@libs/result";

type BaseItem = { id: string };
let nextId = 1000000000000000000n;
function createSimpleId() {
  return (++nextId).toString();
}

export class ItemNotFoundError extends CustomError {
  entityName: string;
  id: string;

  constructor(entityName: string, id: string) {
    super(`${entityName} [${id}] not found.`);
    this.entityName = entityName;
    this.id = id;
  }
}

function extractId(data: Dictionary<unknown>): string {
  if (typeof data.id === "string") {
    return data.id;
  }
  return createSimpleId();
}

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
};

function getPage<T>(items: T[], skip: number, pageSize: number): T[] {
  return items.slice(skip, skip + pageSize);
}

export class SimpleStore<
  TItem extends BaseItem,
  TPaging extends Undef<PagingOptions> = undefined,
  TFilter = {}
> {
  private _entityName: string;
  private _match: ItemMatchFn<TItem, TFilter>;
  private _defaultPageSize: Undef<number>;
  private _map = new Map<string, TItem>();

  constructor({
    entityName,
    match,
    paging,
  }: SimpleStoreOptions<TItem, TPaging, TFilter>) {
    this._entityName = entityName;
    this._match = match ?? (() => true);
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
  }: GetListOptions<TPaging, TFilter>): Promise<TItem[]> {
    console.log("===============================================");
    console.log(arguments);
    console.log("===============================================");
    const filtered = Array.from(this._map.values()).filter((item) =>
      this._match(item, filter)
    );
    const paged =
      this._defaultPageSize == null
        ? filtered
        : getPage(
            filtered,
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
