import { Ctx, CtxKey } from "../ctx.ts";
import { Decorator } from "./types.ts";

export function decorators(entries: Decorator[]): Decorator {
  return (delegate) =>
    entries.reduce((acc, decorator) => decorator(acc), delegate);
}

export function decoratorForCtx(
  mapper: (ctx: Ctx) => Ctx | Promise<Ctx>,
): Decorator {
  return (delegate) => async (input) =>
    delegate({ ...input, ctx: await mapper(input.ctx) });
}

export function decoratorForReq<T>(
  key: CtxKey<T>,
  reader: (req: Request) => T | Promise<T>,
): Decorator {
  return decoratorForCtx(async (ctx) => {
    const value = await reader(ctx.req);
    return ctx.withProps((props) => props.with(key, value));
  });
}
