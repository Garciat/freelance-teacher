import { Responses } from "@/lib/web/respond.ts";
import { descriptor, route } from "@/lib/web/route.ts";

import { PageLayout } from "@/app/layouts/page.tsx";
import { Extras } from "@/app/pages/_extra.ts";

export const descriptors = {
  index: descriptor("GET", "/", { response: Responses.jsx }),
};

export const routes = [
  route(
    descriptors.index,
    (_ctx, { extra: { user } }) => (
      <PageLayout title="Home" user={user}>
        <p>Welcome 🤗</p>
      </PageLayout>
    ),
    { user: Extras.User.required() },
  ),
];
