export const PARAM_PREFIX = ":";

export function splitPath(path: string): string[] {
  return path.split("/").filter((s) => s !== "");
}

export function containsParams(routePath: string) {
  return routePath.includes("/" + PARAM_PREFIX);
}

type RouteMetaEntry = { key: string; index: number };
const routesMeta = new Map<string, RouteMetaEntry[]>();

function getRouteMeta(routePath: string): RouteMetaEntry[] {
  if (routesMeta.has(routePath)) {
    return routesMeta.get(routePath)!;
  }
  const routeSegments = splitPath(routePath);
  const meta = [] as RouteMetaEntry[];
  routeSegments.forEach((segment, index) => {
    if (segment.startsWith(PARAM_PREFIX)) {
      meta.push({ key: segment.slice(1), index });
    }
  });
  routesMeta.set(routePath, meta);
  return meta;
}

export function parseRouteParams(
  routePath: string,
  requestPath: string
): Dictionary<string> {
  const routeMeta = getRouteMeta(routePath);
  const requestSegments = splitPath(requestPath);
  const parsed = {} as Dictionary<string>;
  routeMeta.forEach(({ key, index }) => {
    parsed[key] = requestSegments[index];
  });
  return parsed;
}
