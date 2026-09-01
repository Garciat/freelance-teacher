import { Responses } from "@/lib/web/respond.ts";
import { descriptor, route } from "@/lib/web/route.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export const descriptors = {
  index: descriptor("GET", "/", { response: Responses.jsx }),
};

export const routes = [
  route(
    descriptors.index,
    () => (
      <PageLayout title="Home">
        <p>Welcome 🤗</p>
      </PageLayout>
    ),
  ),
];
