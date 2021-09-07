import { SimpleStore } from "@libs/in-memory-simple-storage";
import type { BookModel } from "./book-model";

const booksStore = new SimpleStore<BookModel>("book");

export const Books = {
  insert: booksStore.insert.bind(booksStore),
  list: booksStore.getAll.bind(booksStore),
  get: booksStore.get.bind(booksStore),
  patch: booksStore.patch.bind(booksStore),
  delete: booksStore.delete.bind(booksStore),
};
