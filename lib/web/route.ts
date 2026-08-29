import { z } from "zod";
import { serveDir } from "@std/http";

import { BaseHandler, Handler } from "./types.ts";
import { BodyParser } from "./body.ts";

export type RouteHandler = Handler<undefined, Response | null>;

export function route<P, Q, B>(
  method: "GET" | "POST",
  pattern: URLPattern,
  pathType: z.ZodType<P>,
  queryType: z.ZodType<Q>,
  bodyParser: BodyParser<B>,
  delegate: Handler<{ path: P; query: Q; body: B }, Response>,
): RouteHandler {
  return async (ctx) => {
    if (ctx.req.method !== method) return null;

    const match = pattern.exec(ctx.url);
    if (match === null) return null;

    const path = pathType.safeDecode(match.pathname.groups);
    if (!path.success) {
      return new Response(
        `invalid path for ${pattern.pathname}\n${z.prettifyError(path.error)}`,
      );
    }

    const query = queryType.safeDecode(match.search.groups);
    if (!query.success) {
      return new Response(
        `invalid query for ${pattern.search}\n${z.prettifyError(query.error)}`,
      );
    }

    const body = await bodyParser(ctx.req);
    if (!body.success) {
      return new Response(
        `invalid body\n${z.prettifyError(body.error)}`,
      );
    }

    return delegate(ctx, {
      path: path.data,
      query: query.data,
      body: body.data,
    });
  };
}

export function routes(entries: RouteHandler[]): BaseHandler {
  return async (ctx) => {
    for (const entry of entries) {
      const res = await entry(ctx, undefined);
      if (res) return res;
    }

    return new Response(`no route: ${ctx.req.method} ${ctx.req.url}`, {
      status: 404,
    });
  };
}

export function localFiles<P, Q>(
  urlRoot: string,
  fsRoot: string,
): RouteHandler {
  const actualFsRoot = fsRoot.startsWith("file://")
    ? fsRoot.slice("file://".length)
    : fsRoot;

  return (ctx) => {
    if (ctx.url.pathname.startsWith(`/${urlRoot}`)) {
      return serveDir(ctx.req, { urlRoot, fsRoot: actualFsRoot, quiet: true });
    }
    return null;
  };
}
