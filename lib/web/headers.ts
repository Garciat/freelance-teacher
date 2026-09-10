export function headersMerge(
  bottom: HeadersInit | undefined,
  top: HeadersInit,
): Headers {
  const headers = new Headers(bottom);
  for (const [name, value] of new Headers(top)) {
    headers.append(name, value);
  }
  return headers;
}
