import { ExtendableError } from "ts-error";

export class NonExhaustedSwitchError extends ExtendableError {
  constructor(label: string, value: never) {
    super(`Unexpected value for ${label}: ${value}`);
  }
}
