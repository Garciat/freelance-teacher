import { Ctx } from "./ctx.ts";

export type Handler<Req extends Record<string, unknown>, Res> = (
  req: { ctx: Ctx } & Req,
) => Res | Promise<Res>;

export type BaseHandler = Handler<Empty, Response>;

export type Empty = Record<never, never>;

/**
 * @throws Response if needs to short-circuit
 */
export type ExtraParser<T = unknown> = (ctx: Ctx) => MaybePromise<T>;

type MaybePromise<T> = T | Promise<T>;
