/** Small typed result primitive for predictable domain and service errors. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function matchResult<T, E, R>(
  result: Result<T, E>,
  handlers: {
    onOk: (value: T) => R;
    onError: (error: E) => R;
  }
): R {
  return result.ok ? handlers.onOk(result.value) : handlers.onError(result.error);
}