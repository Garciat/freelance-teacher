import { z } from "zod";
import { serveDir } from "@std/http";

import * as esbuild from "esbuild";

import { BaseHandler, Handler } from "./types.ts";
import { BodyParser } from "./body.ts";

export type RouteHandler = Handler<undefined, Response | null>;

export function route<
  P = never,
  Q = never,
  B = never,
>(
  method: "GET" | "POST",
  patternInit: URLPatternInit,
  types: { path?: z.ZodType<P>; query?: z.ZodType<Q>; body?: BodyParser<B> },
  delegate: Handler<{ path: P; query: Q; body: B }, Response>,
): RouteHandler {
  const pattern = new URLPattern(patternInit);

  return async (ctx) => {
    if (ctx.req.method !== method) return null;

    const match = pattern.exec(ctx.url);
    if (match === null) return null;

    const data = {} as { path: P; query: Q; body: B };

    if (types.path) {
      const result = types.path.safeParse(match.pathname.groups);
      if (!result.success) {
        return new Response(
          `invalid path for ${pattern.pathname}\n${
            z.prettifyError(result.error)
          }`,
        );
      }
      data.path = result.data;
    }

    if (types.query) {
      const result = types.query.safeParse(match.search.groups);
      if (!result.success) {
        return new Response(
          `invalid query for ${pattern.search}\n${
            z.prettifyError(result.error)
          }`,
        );
      }
      data.query = result.data;
    }

    if (types.body) {
      const result = await types.body(ctx.req);
      if (!result.success) {
        return new Response(
          `invalid body\n${z.prettifyError(result.error)}`,
        );
      }
      data.body = result.data;
    }

    return delegate(ctx, data);
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

export function localFiles(
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

export function bundle(
  urlRoot: string,
  fsRoot: string,
): RouteHandler {
  const actualFsRoot = fsRoot.startsWith("file://")
    ? fsRoot.slice("file://".length)
    : fsRoot;

  return async (ctx) => {
    if (
      ctx.url.pathname.startsWith(urlRoot) &&
      (ctx.url.pathname.endsWith(".tsx") || ctx.url.pathname.endsWith(".ts"))
    ) {
      const path = `${actualFsRoot}/${ctx.url.pathname.slice(urlRoot.length)}`;

      const result = await esbuild.build({
        plugins: [],
        entryPoints: [path],
        bundle: false,
        format: "esm",
        write: false,
        jsx: "automatic",
      });

      if (result.errors.length) {
        throw new Error(result.errors.map((err) => err.text).join("\n"));
      }

      return new Response(result.outputFiles?.at(0)?.text, {
        headers: {
          "content-type": "application/javascript",
        },
      });
    }
    return null;
  };
}
