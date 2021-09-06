import {
  BookSchema,
  BookModel,
  BookCreateSchema,
  BookCreateModel,
  listBooks,
  insertBook,
  getBook,
} from "@libs/books-service";
import { R404 } from "@libs/shared-schemas";
import { Type } from "@sinclair/typebox";
import { server } from "./http";

server.get<{ Reply: BookModel[] }>(
  "/books",
  {
    schema: {
      response: {
        200: Type.Array(BookSchema),
      },
    },
  },
  async () => {
    return listBooks();
  }
);

server.get<{ Params: { bookId: string }; Reply: BookModel | R404 }>(
  "/books/:bookId",
  {
    schema: {
      params: Type.Object({
        bookId: Type.String(),
      }),
      response: {
        200: BookSchema,
        404: R404,
      },
    },
  },
  async (req, res) => {
    const bookResult = await getBook(req.params.bookId);
    if (bookResult.ok) {
      return bookResult.value;
    }

    res.code(404).send(bookResult.error);
  }
);

server.post<{ Body: BookCreateModel; Reply: BookModel }>(
  "/books",
  {
    schema: {
      body: BookCreateSchema,
      response: {
        200: BookSchema,
      },
    },
  },
  async (req) => {
    return insertBook(req.body);
  }
);

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
