import z from "zod";

import React from "react";
import { renderToReadableStream } from "react-dom/server";

import { headersMerge } from "@/lib/web/headers.ts";

export async function jsx(node: React.ReactNode) {
  return new Response(await renderToReadableStream(node), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export function redirect303(target: URL | string, headers?: HeadersInit) {
  return new Response(null, {
    status: 303,
    headers: headersMerge(headers, { "location": target.toString() }),
  });
}

export namespace Responses {
  export const jsx = z.codec(
    z.instanceof(Response),
    z.custom<React.ReactNode>(),
    {
      decode: () => {
        throw new Error("symmetry not supported");
      },
      encode: async (node) =>
        new Response(await renderToReadableStream(node), {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  );
}
