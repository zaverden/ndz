import { NonExhaustedSwitchError } from "@libs/non-exhausted-switch-error";
import {
  Operation,
  RouteDefinition,
  RoutePlaceholder,
  TBody,
  THeaders,
  TParams,
  TQuery,
} from "./route";

const PARAM_SEGMENT = Symbol("PARAM_SEGMENT");
type RoutesStoreKey = string | typeof PARAM_SEGMENT;

class RoutesStore {
  store = new Map<RoutesStoreKey, RoutePlaceholder | RoutesStore>();

  get(segments: string[]): RoutePlaceholder | undefined {
    const [segment, ...restSegments] = segments;
    let storeOrRoute = this.store.get(segment) ?? this.store.get(PARAM_SEGMENT);
    if (storeOrRoute == null) {
      return undefined;
    }

    const itemType = storeOrRoute instanceof RoutesStore ? "store" : "route";
    const nodeType = restSegments.length === 0 ? "leaf" : "node";
    const caseKey = `${itemType}-${nodeType}` as const;

    switch (caseKey) {
      case "store-node":
        return (storeOrRoute as RoutesStore).get(restSegments);
      case "store-leaf":
        return undefined;
      case "route-leaf":
        return storeOrRoute as RoutePlaceholder;
      case "route-node":
        return undefined;
      default:
        throw new NonExhaustedSwitchError("case", caseKey);
    }
  }

  set(segments: string[], route: RoutePlaceholder): void {
    const [segment, ...restSegments] = segments;
    const key = segment.startsWith(":") ? PARAM_SEGMENT : segment;
    restSegments.length === 0
      ? this._setLeaf(key, route)
      : this._setNode(key, restSegments, route);
  }

  _setLeaf(key: RoutesStoreKey, route: RoutePlaceholder): void {
    if (this.store.has(key)) {
      const registeredRoute = this.store.get(key) as RoutePlaceholder;
      throw new Error(
        `Route '${route.operation} ${route.path}' conflicts with ` +
          `previously registered route '${registeredRoute.operation} ${registeredRoute.path}'`
      );
    }
    this.store.set(key, route);
  }

  _setNode(
    key: RoutesStoreKey,
    restSegments: string[],
    route: RoutePlaceholder
  ): void {
    let nodeStore = this.store.get(key) as RoutesStore | undefined;
    if (nodeStore == null) {
      nodeStore = new RoutesStore();
      this.store.set(key, nodeStore);
    }
    nodeStore.set(restSegments, route);
  }
}

export class Router {
  opsMap = new Map<Operation, Map<number, RoutesStore>>();

  route<
    TOp extends Operation,
    TPath extends string,
    TParamsSchema extends TParams<TPath> | undefined = undefined,
    TBodySchema extends TBody | undefined = undefined,
    THeadersSchema extends THeaders | undefined = undefined,
    TQuerySchema extends TQuery | undefined = undefined
  >(
    definition: RouteDefinition<
      TOp,
      TPath,
      TParamsSchema,
      TBodySchema,
      THeadersSchema,
      TQuerySchema
    >
  ): this {
    const { operation, path } = definition;
    const segments = this._splitPath(path);

    let storesMap = this.opsMap.get(operation);
    if (storesMap == null) {
      storesMap = new Map();
      this.opsMap.set(operation, storesMap);
    }

    let store = storesMap.get(segments.length);
    if (store == null) {
      store = new RoutesStore();
      storesMap.set(segments.length, store);
    }

    store.set(segments, definition);
    return this;
  }

  resolve(op: Operation, path: string): RoutePlaceholder | undefined {
    const segments = this._splitPath(path);
    return this.opsMap.get(op)?.get(segments.length)?.get(segments);
  }

  _splitPath(path: string): string[] {
    return path.split("/").filter((s) => s !== "");
  }
}
