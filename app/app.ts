import { decorators } from "@/lib/web/decorator/base.ts";
import { logging } from "@/lib/web/decorator/logging.ts";
import { Cookies } from "@/lib/web/decorator/cookies.ts";
import { bundle, localFiles, routes } from "@/lib/web/route.ts";

import * as students from "@/app/pages/students.tsx";
import * as home from "@/app/pages/home.tsx";
import * as invoices from "@/app/pages/invoices.tsx";

export default decorators([
  logging(),
  Cookies.decorator(),
])(
  routes([
    ...home.routes,
    ...students.routes,
    ...invoices.routes,
    localFiles(
      "static",
      import.meta.resolve("./static"),
    ),
    bundle(
      "/shared",
      import.meta.resolve("./shared"),
    ),
    bundle(
      "/frontend",
      import.meta.resolve("./frontend"),
    ),
  ]),
);
