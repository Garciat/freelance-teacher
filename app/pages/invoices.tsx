import { jsx } from "@/lib/web/respond.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export default {
  index() {
    return jsx(
      <PageLayout title="Invoices">
        <p>TODO</p>
      </PageLayout>,
    );
  },
};
