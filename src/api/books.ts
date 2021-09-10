import { Books, BookSchema } from "@libs/books-service";
import { crudRoutes } from "@libs/crud-routes";

export const booksRoutes = crudRoutes({
  prefix: "/books",
  withPaging: true,
  sortKeys: [],
  schemas: {
    item: BookSchema,
  },
  handlers: Books,
});
