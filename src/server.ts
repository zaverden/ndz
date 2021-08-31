import "source-map-support/register";
import { Type } from "@sinclair/typebox";
import { Router } from "@libs/router";
import { createServer } from "./http";

let i = 0;

const router = new Router()
  .route({
    operation: "GET",
    path: "/api/users",
    schemes: {},
    handler() {
      return { date: new Date(), i: i++ };
    },
  })
  .route({
    operation: "GET",
    path: "/api/users/:userId",
    schemes: {
      params: Type.Object({
        userId: Type.String(),
      }),
    },
    handler({ params }) {
      return { date: new Date(), i: i++, params };
    },
  });

const server = createServer(router);
const port = parseInt(process.env.PORT ?? "3000");
server.listen(port, () => {
  console.log(process.pid, `listening http://localhost:${port}`);
});

function gracefulShutdown(signal: string) {
  console.log(process.pid, signal);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
