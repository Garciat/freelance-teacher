import { Handler } from "../types.ts";

export type Decorator = <Req, Res>(
  delegate: Handler<Req, Res>,
) => Handler<Req, Res>;
