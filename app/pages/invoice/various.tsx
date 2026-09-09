import { redirect303 } from "@/lib/web/respond.ts";
import { formatRoute, route } from "@/lib/web/route.ts";

import { Invoice } from "@/app/data/invoice.ts";

import { Extras } from "@/app/pages/_extra.ts";
import { PagesInvoice } from "@/app/pages/invoice/_meta.ts";

export const RouteInvoice = {
  document: route(
    PagesInvoice.invoice.document,
    async ({ path, user }) => {
      const invoice = await Invoice.get(user.id, path.id);

      return new Response(invoice.document.invoice, {
        headers: {
          "content-type": "application/pdf",
          "content-disposition":
            `inline; filename="invoice-${invoice.sequenceNumber}.pdf"`,
        },
      });
    },
    { user: Extras.User.required() },
  ),

  markFinalized: route(
    PagesInvoice.invoice.markFinalized,
    async ({ path, user }) => {
      await Invoice.markFinalized(user.id, path.id);

      return redirect303(formatRoute(PagesInvoice.index, {}));
    },
    { user: Extras.User.required() },
  ),

  markPaid: route(
    PagesInvoice.invoice.markPaid,
    async ({ path, user }) => {
      await Invoice.markPaid(user.id, path.id);

      return redirect303(formatRoute(PagesInvoice.index, {}));
    },
    { user: Extras.User.required() },
  ),
} as const;
