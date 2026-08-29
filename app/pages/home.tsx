import { jsx } from "@/lib/web/respond.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export default {
  get() {
    return jsx(
      <PageLayout title="Home">
        <p>Welcome 🤗</p>
      </PageLayout>,
    );
  },
};
