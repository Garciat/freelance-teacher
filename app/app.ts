import { z } from "zod";

import { decorators } from "@/lib/web/decorator/base.ts";
import { logging } from "@/lib/web/decorator/logging.ts";
import { Cookies } from "@/lib/web/decorator/cookies.ts";
import { bundle, localFiles, route, routes } from "@/lib/web/route.ts";
import { BodyParsers } from "@/lib/web/body.ts";

import students from "@/app/pages/students.tsx";
import home from "@/app/pages/home.tsx";
import invoices from "@/app/pages/invoices.tsx";

export default decorators([
  logging(),
  Cookies.decorator(),
])(
  routes([
    route(
      "GET",
      new URLPattern({ pathname: "/" }),
      z.object(),
      z.object(),
      BodyParsers.nil(),
      home.get,
    ),
    route(
      "GET",
      new URLPattern({ pathname: "/students/" }),
      z.object(),
      z.object(),
      BodyParsers.nil(),
      students.index,
    ),
    route(
      "GET",
      new URLPattern({ pathname: "/students/register" }),
      z.object(),
      z.object(),
      BodyParsers.nil(),
      students.register,
    ),
    route(
      "POST",
      new URLPattern({ pathname: "/students/register" }),
      z.object(),
      z.object(),
      BodyParsers.formData(students.registerPostSchema),
      students.registerPost,
    ),
    route(
      "POST",
      new URLPattern({ pathname: "/students/:id/delete" }),
      z.object({
        id: z.uuid(),
      }),
      z.object(),
      BodyParsers.formData(students.deleteSchema),
      students.delete,
    ),
    route(
      "GET",
      new URLPattern({ pathname: "/invoices/" }),
      z.object(),
      z.object(),
      BodyParsers.nil(),
      invoices.index,
    ),
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
