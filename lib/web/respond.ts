import { VNode } from "preact";
import { render } from "preact-render-to-string/jsx";

export function jsx(vnode: VNode) {
  const html = render(vnode, {}, { pretty: "  " });

  const body = `<!DOCTYPE html>\n${html}`;

  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export function redirect303(target: URL) {
  return new Response(null, {
    status: 303,
    headers: { "location": target.toString() },
  });
}
