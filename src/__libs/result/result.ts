type ResultOk<TValue> = {
  ok: true;
  value: TValue;
  error?: never;
};
type ResultError<TError extends Error> = {
  ok: false;
  value?: never;
  error: TError;
};

export type Result<TValue, TError extends Error = Error> =
  | ResultOk<TValue>
  | ResultError<TError>;

function ok(): ResultOk<void>;
function ok<T>(value: T): ResultOk<T>;
function ok<T>(value?: T): ResultOk<T | void> {
  return { ok: true, value };
}

function error<T extends Error>(error: T): ResultError<T> {
  return { ok: false, error };
}

export const Result = { ok, error };
