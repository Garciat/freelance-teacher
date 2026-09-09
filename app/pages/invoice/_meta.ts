import z from "zod";

import { BigDecimalCodec, BigIntCodec, IntegerCodec } from "@/lib/codecs.ts";
import { Body } from "@/lib/web/body.ts";
import { makePostSchema } from "@/lib/web/forms.tsx";
import { Responses } from "@/lib/web/respond.ts";
import { descriptor } from "@/lib/web/route.ts";

export const PagesInvoice = {
  index: descriptor("GET", "/invoices/", { response: Responses.jsx }),

  create: {
    get: descriptor("GET", "/invoices/create", { response: Responses.jsx }),

    post: descriptor("POST", "/invoices/create", {
      body: Body.formData(makePostSchema(z.object({
        sequence_no: BigIntCodec,
        student_id: z.uuid(),
        lesson_count: IntegerCodec,
        hourly_rate: BigDecimalCodec,
        vat_rate: z.enum(["0", "21"]),
        deadline_days: IntegerCodec,
      }))),
    }),
  },

  invoice: {
    markFinalized: descriptor("POST", "/invoices/:id/finalize", {
      path: z.object({ id: BigIntCodec }),
    }),

    markPaid: descriptor("POST", "/invoices/:id/paid", {
      path: z.object({ id: BigIntCodec }),
    }),

    send: {
      get: descriptor("GET", "/invoices/:id/send", {
        path: z.object({ id: BigIntCodec }),
        response: Responses.jsx,
      }),
      post: descriptor("POST", "/invoices/:id/send", {
        path: z.object({ id: BigIntCodec }),
        body: Body.formData(makePostSchema(z.object({}))),
      }),
    },

    document: descriptor("GET", "/invoices/:id/document", {
      path: z.object({ id: BigIntCodec }),
    }),
  },
} as const;
