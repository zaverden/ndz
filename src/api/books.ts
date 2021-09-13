import { crudRoutes } from "@libs/crud-routes";
import { NullOr, SimpleComparer, SimpleStore } from "@libs/in-memory-simple-storage";
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
      }),
      {
        minItems: 1,
      }
    ),
  },
  {
    additionalProperties: false,
  }
);

const BookFilterSchema = Type.Partial(
  Type.Object({
    id: Type.String(),
    title: Type.String(),
    year: Type.Integer(),
    contactEmail: Type.String(),
  }),
  {
    additionalProperties: false,
  }
);

type BookModel = Flatten<Static<typeof BookSchema>>;
type BookFilterModel = Flatten<Static<typeof BookFilterSchema>>;

function matchBook(filter: BookFilterModel, book: BookModel) {
  return (
    NullOr.eq(filter.id, book.id) &&
    NullOr.eq(filter.year, book.year) &&
    NullOr.contains(filter.title, book.title) &&
    NullOr.contains(filter.contactEmail, book.contactEmail)
  );
}

const booksStore = new SimpleStore({
  entityName: "book",
  match: matchBook,
  compare: (key, left, right) => {
    if (key === "authorsCount") {
      return SimpleComparer.number(
        left.authors.length,
        right.authors.length
      );
    }
    // default
    return undefined;
  },
  paging: {
    defaultPageSize: 20,
  },
});

export const booksRoutes = crudRoutes({
  prefix: "/books",
  withPaging: true,
  sortKeys: ["title", "authorsCount"],
  schemas: {
    item: BookSchema,
    filter: BookFilterSchema,
  },
  handlers: booksStore.bind(),
});
