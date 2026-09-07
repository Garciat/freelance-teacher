import { jsx } from "@/lib/web/respond.ts";
import { descriptor, formatRoute, route } from "@/lib/web/route.ts";

import business from "@/app/data/business.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";
import { Extras } from "@/app/pages/_extra.ts";
import { renderInvoiceToBlob } from "@/app/shared/invoice.tsx";

export const descriptors = {
  index: descriptor("GET", "/invoices/", {}),
  example: descriptor("GET", "/invoices/example", {}),
};

export const routes = [
  route(
    descriptors.index,
    ({ user }) =>
      jsx(
        <PageLayout title="Invoices" user={user}>
          <iframe
            src={formatRoute(
              descriptors.example,
              {
                path: undefined,
                query: undefined,
                hash: { "toolbar": "0", "navpanes": "0", "zoom": "page-fit" },
              },
            )}
            style={{ aspectRatio: "210 / 297", width: "100%" }}
          >
          </iframe>
        </PageLayout>,
      ),
    { user: Extras.User.required() },
  ),
  route(
    descriptors.example,
    async ({ user }) =>
      new Response(
        await renderInvoiceToBlob({
          sender: await business.get(user.id),
          client: {
            name: "Rotterdam Shipping Co.",
            address: "Coolsingel 65",
            zipCity: "3012 AC Rotterdam",
          },
          invoiceMeta: {
            number: "2026-0042", // Sequential numbering required
            date: "29-08-2026",
            dueDate: "12-09-2026",
            paymentTerms: "14",
          },
          items: [
            {
              description: "Frontend Development (React consulting)",
              qty: 40,
              price: 85.00,
              vatPct: 21,
            },
            {
              description: "Cloud Infrastructure Setup & CI/CD pipeline",
              qty: 1,
              price: 1200.00,
              vatPct: 0,
            },
          ],
        }),
      ),
    { user: Extras.User.required() },
  ),
];
