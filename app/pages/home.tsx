import z from "zod";

import { BodyParsers } from "@/lib/web/body.ts";
import { route } from "@/lib/web/route.ts";
import { jsx } from "@/lib/web/respond.ts";

import { PageLayout } from "@/app/layouts/page.tsx";

export const routes = [
  route(
    "GET",
    new URLPattern({ pathname: "/" }),
    z.object(),
    z.object(),
    BodyParsers.nil(),
    () =>
      jsx(
        <PageLayout title="Home">
          <p>Welcome 🤗</p>
        </PageLayout>,
      ),
  ),
];
