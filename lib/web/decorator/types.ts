import { Handler } from "../types.ts";

export type Decorator = <Req extends Record<string, unknown>, Res>(
  delegate: Handler<Req, Res>,
) => Handler<Req, Res>;
