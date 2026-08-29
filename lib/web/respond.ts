// @ts-types="npm:@types/react-dom/server"
import { renderToReadableStream } from "react-dom/server";

export async function jsx(vnode: React.ReactNode) {
  return new Response(await renderToReadableStream(vnode), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export function redirect303(target: URL) {
  return new Response(null, {
    status: 303,
    headers: { "location": target.toString() },
  });
}
