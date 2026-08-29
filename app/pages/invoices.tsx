import { jsx } from "@/lib/web/respond.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export default {
  index() {
    return jsx(
      <PageLayout title="Invoices">
        <div id="root"></div>
        <script type="module" src="/frontend/example.tsx"></script>
      </PageLayout>,
    );
  },
};
