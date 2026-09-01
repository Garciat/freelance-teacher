import { z } from "zod";

export type BodyParser<T> = (req: Request) => Promise<z.ZodSafeParseResult<T>>;

export namespace BodyParsers {
  export function nil(): BodyParser<null> {
    return (req) => Promise.resolve(z.null().safeParse(req.body));
  }

  export function formData<T>(type: z.ZodType<T>): BodyParser<T> {
    return async (req) =>
      type.safeDecode(Object.fromEntries((await req.formData()).entries()));
  }
}

export namespace Body {
  export function formData<T>(
    type: z.ZodType<T, Record<string, string | File>>,
  ) {
    return z.codec(
      z.instanceof(Request),
      type,
      {
        decode: async (req) =>
          Object.fromEntries((await req.formData()).entries()),
        encode: (record) => {
          const body = new FormData();
          for (const [key, value] of Object.entries(record)) {
            body.set(key, value);
          }
          return new Request("", { body });
        },
      },
    );
  }
}
