import { server } from "./http";

server.listen(3000, () => {
  console.log(process.pid, "listening");
});

function gracefulShutdown(signal: string) {
  console.log(process.pid, "SIGTERM");
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
