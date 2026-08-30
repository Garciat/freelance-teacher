import { jsx } from "@/lib/web/respond.ts";
import { route } from "@/lib/web/route.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export const routes = [
  route(
    "GET",
    { pathname: "/invoices/" },
    {},
    () =>
      jsx(
        <PageLayout title="Invoices">
          <div id="root"></div>
          <script type="module" src="/frontend/example.tsx"></script>
        </PageLayout>,
      ),
  ),
];
