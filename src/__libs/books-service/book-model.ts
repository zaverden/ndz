import { Type as T, Static } from "@sinclair/typebox";

export const BookSchema = T.Object(
  {
    id: T.String(),
    title: T.String(),
    year: T.Integer(),
    contactEmail: T.String({ format: "email" }),
    authors: T.Array(
      T.Object({
        firstName: T.String(),
        lastName: T.String(),
      })
    ),
  },
  {
    additionalProperties: false,
  }
);
export type BookModel = Flatten<Static<typeof BookSchema>>;

export const BookCreateSchema = T.Omit(BookSchema, ["id"]);
export type BookCreateModel = Flatten<Static<typeof BookCreateSchema>>;

export const BookPatchSchema = T.Partial(BookCreateSchema);
export type BookPatchModel = Flatten<Static<typeof BookPatchSchema>>;
