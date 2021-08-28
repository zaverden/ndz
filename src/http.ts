import { createServer } from "http";

let i = 0;
export const server = createServer((req, res) => {
  console.log(process.pid, {
    url: req.url,
    method: req.method,
  });
  res.end(JSON.stringify({ date: new Date(), i: i++ }));
});
