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

const NullOr = {
  eq<T>(f: Undef<T>, v: Undef<T>): boolean {
    return f == null || f === v;
  },
  contains(f: Undef<string>, v: Undef<string>): boolean {
    return f == null || (v ?? "").includes(f);
  },
};

function matchBook(book: BookModel, filter: BookFilterModel) {
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
  paging: {
    defaultPageSize: 20,
  },
});

export const booksRoutes = crudRoutes({
  prefix: "/books",
  withPaging: true,
  sortKeys: [],
  schemas: {
    item: BookSchema,
    filter: BookFilterSchema,
  },
  handlers: booksStore.bind(),
});
