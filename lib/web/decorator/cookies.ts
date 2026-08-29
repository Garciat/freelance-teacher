import { createCtxKey, Ctx } from "../ctx.ts";
import { decoratorForReq } from "./base.ts";
import { Decorator } from "./types.ts";

export class Cookies {
  private static readonly KEY = createCtxKey<Cookies>(Cookies.name);

  constructor() {}

  static get(ctx: Ctx): Cookies {
    return ctx.props.get(Cookies.KEY);
  }

  static decorator(): Decorator {
    return decoratorForReq(Cookies.KEY, (req) => Cookies.read(req));
  }

  private static read(_req: Request): Cookies {
    return new Cookies();
  }
}
