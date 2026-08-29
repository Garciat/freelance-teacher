import { Ctx, CtxKey } from "../ctx.ts";
import { Decorator } from "./types.ts";

export function decorators(entries: Decorator[]): Decorator {
  return (delegate) =>
    entries.reduce((acc, decorator) => decorator(acc), delegate);
}

export function decoratorForCtx(mapper: (ctx: Ctx) => Ctx): Decorator {
  return (delegate) => (ctx, req) => delegate(mapper(ctx), req);
}

export function decoratorForReq<T>(
  key: CtxKey<T>,
  reader: (req: Request) => T,
): Decorator {
  return decoratorForCtx((ctx) =>
    ctx.withProps((props) => props.with(key, reader(ctx.req)))
  );
}
