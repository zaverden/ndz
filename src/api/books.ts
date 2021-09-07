import { Books, BookSchema } from "@libs/books-service";
import { crudRoutes } from "@libs/crud-routes";

export const booksRoutes = crudRoutes({
  prefix: "/books",
  schemas: {
    item: BookSchema,
  },
  handlers: {
    get: Books.get,
    insert: Books.insert,
  },
});
