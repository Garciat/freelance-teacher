declare const ctxKeyBrand: unique symbol;

export type CtxKey<T> = symbol & { [ctxKeyBrand]: T };

export function createCtxKey<T>(name: string): CtxKey<T> {
  return Symbol(name) as CtxKey<T>;
}

export class CtxProps {
  constructor(
    private readonly data: ReadonlyMap<CtxKey<unknown>, unknown>,
  ) {}

  get<T>(key: CtxKey<T>): T {
    const value = this.data.get(key) as T | undefined;
    if (value === undefined) {
      throw new Error(
        `[${CtxProps.name}] bad key: ${
          String(key)
        }; decorator likely not configured`,
      );
    }
    return value;
  }

  with<T>(key: CtxKey<T>, value: T): CtxProps {
    return new CtxProps(
      new Map([
        ...this.data.entries(),
        [key, value],
      ]),
    );
  }

  static empty(): CtxProps {
    return new CtxProps(new Map());
  }
}

export class Ctx {
  constructor(
    public readonly req: Request,
    public readonly info: Deno.ServeHandlerInfo,
    public readonly url: URL,
    public readonly props: CtxProps,
  ) {}

  static from(req: Request, info: Deno.ServeHandlerInfo): Ctx {
    return new Ctx(
      req,
      info,
      new URL(req.url),
      CtxProps.empty(),
    );
  }

  withProps(mapper: (props: CtxProps) => CtxProps): Ctx {
    return new Ctx(
      this.req,
      this.info,
      this.url,
      mapper(this.props),
    );
  }
}
