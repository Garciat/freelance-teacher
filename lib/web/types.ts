import { Ctx } from "./ctx.ts";

export type Handler<Req, Res> = (ctx: Ctx, req: Req) => Res | Promise<Res>;

export type BaseHandler = Handler<undefined, Response>;
