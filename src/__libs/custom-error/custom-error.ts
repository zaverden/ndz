import { ExtendableError } from "ts-error";

type ToObjectOptions = {
  includeStack?: boolean;
};

type AsKV<T> = {
  [K in keyof T]: T[K];
};

export class CustomError extends ExtendableError {
  toObject(options?: ToObjectOptions): AsKV<this> {
    const { includeStack = true } = options ?? {};
    // name, stack and message are not enumerable properties
    // so we don't have them after spread
    const object = {
      ...this,
      name: this.name,
      message: this.message,
    };
    if (includeStack) {
      object.stack = this.stack;
    }
    return object;
  }
}
