import z from "zod";

import { BodyParsers } from "@/lib/web/body.ts";
import { jsx } from "@/lib/web/respond.ts";
import { route } from "@/lib/web/route.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export const routes = [
  route(
    "GET",
    new URLPattern({ pathname: "/invoices/" }),
    z.object(),
    z.object(),
    BodyParsers.nil(),
    () =>
      jsx(
        <PageLayout title="Invoices">
          <div id="root"></div>
          <script type="module" src="/frontend/example.tsx"></script>
        </PageLayout>,
      ),
  ),
];
