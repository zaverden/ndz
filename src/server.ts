import { booksRoutes } from "./api/books";
import { server } from "./http";

server.routes(booksRoutes).listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(process.pid, `listening ${address}`);
});

async function gracefulShutdown(signal: string) {
  console.log(process.pid, signal);
  console.log('===============================================================\n\n\n\n\n');
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
