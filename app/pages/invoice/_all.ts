import { RouteHandler } from "@/lib/web/route.ts";

import { RouteInvoiceCreate } from "@/app/pages/invoice/create.tsx";
import { RouteInvoiceIndex } from "@/app/pages/invoice/index.tsx";
import { RouteInvoiceSend } from "@/app/pages/invoice/send.tsx";
import { RouteInvoice } from "@/app/pages/invoice/various.tsx";

export const RoutesInvoice = [
  RouteInvoiceIndex,
  RouteInvoiceCreate.get,
  RouteInvoiceCreate.post,
  RouteInvoiceSend.get,
  RouteInvoiceSend.post,
  RouteInvoice.document,
  RouteInvoice.markFinalized,
  RouteInvoice.markPaid,
] as const satisfies RouteHandler[];
