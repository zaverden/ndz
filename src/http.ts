import { createId } from "@libs/sequential-id";
import createFastify, { RouteOptions } from "fastify";

const fastifyServer = createFastify({
  logger: true,
  requestIdLogLabel: "requestId",
  genReqId(req) {
    const requestIdHeader = req.headers["request-id"];
    if (requestIdHeader == null) {
      return createId();
    }
    if (typeof requestIdHeader === "string") {
      return requestIdHeader;
    }
    return requestIdHeader[0];
  },
});
type FastifyServer = typeof fastifyServer;

interface ServerExt extends FastifyServer {
  routes(options: RouteOptions[]): this;
}

export const server: ServerExt = Object.assign(fastifyServer, {
  routes(options: RouteOptions[]) {
    options.forEach((routeDefinition) => {
      server.route(routeDefinition);
    });
    return server;
  },
});
