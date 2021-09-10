import { crudRoutes } from "@libs/crud-routes";
import { SimpleStore } from "@libs/in-memory-simple-storage";
import { Static, Type } from "@libs/typebox";

const BookSchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    year: Type.Integer(),
    contactEmail: Type.String({ format: "email" }),
    authors: Type.Array(
      Type.Object({
        firstName: Type.String(),
        lastName: Type.String(),
      })
    ),
  },
  {
    additionalProperties: false,
  }
);
type BookModel = Flatten<Static<typeof BookSchema>>;

const booksStore = new SimpleStore<BookModel>("book");

export const booksRoutes = crudRoutes({
  prefix: "/books",
  withPaging: true,
  sortKeys: [],
  schemas: {
    item: BookSchema,
  },
  handlers: booksStore.bind(),
});
