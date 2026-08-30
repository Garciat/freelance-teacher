import { route } from "@/lib/web/route.ts";
import { jsx } from "@/lib/web/respond.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export const routes = [
  route(
    "GET",
    { pathname: "/" },
    {},
    () =>
      jsx(
        <PageLayout title="Home">
          <p>Welcome 🤗</p>
        </PageLayout>,
      ),
  ),
];
