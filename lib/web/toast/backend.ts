import { setCookie } from "@std/http/cookie";

export function makeToastHeaders(contents: string): Headers {
  const h = new Headers();
  setCookie(h, {
    name: "toast",
    value: encodeURIComponent(contents),
    httpOnly: false,
    path: "/",
  });
  return h;
}
