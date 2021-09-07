import { booksRoutes } from "./api/books";
import { server } from "./http";

booksRoutes.forEach((routeDefinition) => {
  server.route(routeDefinition);
});

server.listen(3000, () => {
  console.log(process.pid, "listening");
});

async function gracefulShutdown(signal: string) {
  console.log(process.pid, signal);
  try {
    await server.close();
    process.exit(0);
  } catch (err) {
    console.error("graceful shutdown error", err);
    process.exit(1);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
