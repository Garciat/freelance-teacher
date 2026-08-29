import { Ctx } from "@/lib/web/ctx.ts";

import app from "@/app/app.ts";

Deno.serve(
  {
    hostname: "localhost",
    port: 3000,
    onListen(addr) {
      console.log(`Listening on http://${addr.hostname}:${addr.port}`);
    },
  },
  async (req, info) => {
    const ctx = Ctx.from(req, info);
    return await app(ctx, undefined);
  },
);
