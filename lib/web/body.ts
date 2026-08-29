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
