import z from "zod";

import { InstantISO8601 } from "@/lib/codecs.ts";

export const BasicEvent = z.object({
  timestamp: InstantISO8601,
});
