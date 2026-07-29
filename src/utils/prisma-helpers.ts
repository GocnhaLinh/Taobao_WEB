/**
 * Chỉ skip khi value là undefined
 * Dùng cho: số (0), nullable fields (null)
 */
export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined;

/**
 * Skip khi value là undefined hoặc null
 * Dùng cho: search / text (tránh null.trim() crash)
 */
export const isPresent = <T>(value: T | null | undefined): value is T =>
  value != null;

/**
 * Skip khi value là undefined, null, hoặc empty string
 * Dùng cho: search / filter text
 */
export const isNotEmpty = (value: string | null | undefined): value is string =>
  value != null && value.trim() !== "";
