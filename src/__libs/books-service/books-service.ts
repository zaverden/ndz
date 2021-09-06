import { SimpleStore } from "@libs/in-memory-simple-storage";
import type { BookModel } from "./book-model";

const booksStore = new SimpleStore<BookModel>("book");

export const insertBook = booksStore.insert.bind(booksStore);
export const listBooks = booksStore.getAll.bind(booksStore);
export const getBook = booksStore.get.bind(booksStore);
export const patchBook = booksStore.patch.bind(booksStore);
export const deleteBook = booksStore.delete.bind(booksStore);
