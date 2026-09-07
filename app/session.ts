import z from "zod";

import { SessionItem } from "@/lib/web/session.ts";

export const AuthSession = new SessionItem({
  secret: new TextEncoder().encode("my happy secret"),
  cookieName: "auth",
  ttl: Temporal.Duration.from({ days: 7 }),
  schema: z.object({
    email: z.string(),
  }),
});
