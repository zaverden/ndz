import { Operation, Router } from "@libs/router";
import { createServer as createHttpServer, Server } from "http";
import { containsParams, parseRouteParams } from "./__libs/router/path";

export function createServer(router: Router): Server {
  return createHttpServer((req, res) => {
    console.log(process.pid, {
      url: req.url,
      method: req.method,
    });

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const route = router.resolve(req.method as Operation, url.pathname);

    if (route == null) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const result = route.handler({
      params: containsParams(route.path)
        ? parseRouteParams(route.path, url.pathname)
        : undefined,
    });

    if (typeof result === "object") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
      return;
    }

    res.end(result);
  });
}
