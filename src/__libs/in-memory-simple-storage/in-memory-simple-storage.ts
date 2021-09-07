import { CustomError } from "@libs/custom-error";
import { Result } from "@libs/result";

type BaseItem = { id: string };
let nextId = 1000000000000000000;
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

export class SimpleStore<TItem extends BaseItem> {
  _entityName: string;
  _map = new Map<string, TItem>();

  constructor(entityName: string) {
    this._entityName = entityName;
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

  async getAll(): Promise<TItem[]> {
    return Array.from(this._map.values());
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
    return Result.ok();
  }
}
