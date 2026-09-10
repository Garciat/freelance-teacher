/// <reference lib="dom" />

export async function consumeToast(): Promise<string | undefined> {
  const cookie = await globalThis.cookieStore.get("toast");
  if (cookie === null) {
    return undefined;
  }
  await globalThis.cookieStore.delete("toast");
  if (!cookie.value) {
    return undefined;
  }
  return decodeURIComponent(cookie.value);
}
