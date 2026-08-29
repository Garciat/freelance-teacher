import { trace } from "@opentelemetry/api";

import { Decorator } from "./types.ts";

export function logging(): Decorator {
  return (delegate) => async (ctx, req) => {
    const span = trace.getActiveSpan();

    console.debug(
      `[${span?.spanContext().traceId}] [-] ${ctx.req.method} ${ctx.url}`,
    );

    const start = performance.now();

    const res = await delegate(ctx, req);

    const duration = performance.now() - start;

    const extra = res instanceof Response ? `status=${res.status}` : "";

    console.debug(
      `[${span?.spanContext().traceId}] [*] ${extra} duration=${
        duration.toFixed(3)
      }ms`,
    );

    return res;
  };
}
