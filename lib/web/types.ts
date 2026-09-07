import { Ctx } from "./ctx.ts";

export type Handler<Req extends Record<string, unknown>, Res> = (
  req: { ctx: Ctx } & Req,
) => Res | Promise<Res>;

export type BaseHandler = Handler<{}, Response>;

export type ExtraParser<T = unknown> = (ctx: Ctx) => MaybePromise<T | Response>;

type MaybePromise<T> = T | Promise<T>;
