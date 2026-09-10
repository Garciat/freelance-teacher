import z from "zod";

import { Body } from "@/lib/web/body.ts";
import { FormRegistry, makePostSchema } from "@/lib/web/forms.tsx";
import { Responses } from "@/lib/web/respond.ts";
import { descriptor } from "@/lib/web/route.ts";

// TODO stop using as form generator
export const RegisterFormSchema = z.object({
  name: z.string().trim().nonempty().register(FormRegistry, {
    label: "Name",
    type: "text",
    placeholder: "John Student",
  }),
  age_category: z.enum(["adult", "child"]).default("adult").register(
    FormRegistry,
    {
      label: "Age Category",
      type: "select",
      options: [
        { value: "adult", label: "Adult" },
        { value: "child", label: "Child" },
      ],
    },
  ),
  billing_name: z.string().trim().nonempty().register(FormRegistry, {
    label: "Billing Name",
    type: "text",
    placeholder: "Mary van Parent",
  }),
  billing_address: z.string().trim().nonempty().register(FormRegistry, {
    label: "Billing Address",
    type: "text",
    placeholder: "Street 420",
  }),
  billing_location: z.string().trim().nonempty().register(FormRegistry, {
    label: "Billing Location",
    type: "text",
    placeholder: "1013BH Amsterdam",
  }),
  contact_email: z.union([z.literal(""), z.email()]).register(FormRegistry, {
    label: "Contact E-mail",
    type: "text",
    inputMode: "email",
    placeholder: "hello@world.com",
  }),
  contact_whatsapp: z.string().trim().optional().register(FormRegistry, {
    label: "Contact WhatsApp",
    type: "text",
    inputMode: "tel",
    placeholder: "+31 612300789",
  }),
});

export const PagesStudent = {
  index: descriptor("GET", "/students/", {
    response: Responses.jsx,
  }),
  register: {
    get: descriptor("GET", "/students/register", {
      response: Responses.jsx,
    }),
    post: descriptor("POST", "/students/register", {
      body: Body.formData(makePostSchema(RegisterFormSchema)),
    }),
  },
  manage: {
    get: descriptor("GET", "/students/manage/:id", {
      path: z.object({ id: z.uuid() }),
    }),
    post: descriptor("POST", "/students/manage/:id", {
      path: z.object({ id: z.uuid() }),
      body: Body.formData(makePostSchema(RegisterFormSchema)),
    }),
  },
  delete: {
    post: descriptor("POST", "/students/delete/:id", {
      path: z.object({ id: z.uuid() }),
      body: Body.formData(z.object({})),
    }),
  },
};
