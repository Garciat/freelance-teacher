import { decorators } from "@/lib/web/decorator/base.ts";
import { logging } from "@/lib/web/decorator/logging.ts";
import { bundle, localFiles, routes } from "@/lib/web/route.ts";

import { AuthSession } from "@/app/session.ts";

import * as auth from "@/app/pages/auth.tsx";
import * as business from "@/app/pages/business.tsx";
import * as home from "@/app/pages/home.tsx";
import * as invoices from "@/app/pages/invoices.tsx";
import * as students from "@/app/pages/students.tsx";

export default decorators([
  logging(),
  AuthSession.decorator(),
])(
  routes([
    ...auth.routes,
    ...home.routes,
    ...business.routes,
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
