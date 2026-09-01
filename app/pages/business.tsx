import z from "zod";

import { Body } from "@/lib/web/body.ts";
import {
  FormRegistry,
  makePostSchema,
  SchemaBasedForm,
} from "@/lib/web/forms.tsx";
import { redirect303, Responses } from "@/lib/web/respond.ts";
import { descriptor, formatRoute, route } from "@/lib/web/route.ts";

import business from "@/app/data/business.ts";
import { PageLayout } from "@/app/layouts/page.tsx";

const UpdateFormSchema = z.object({
  name: z.string().trim().nonempty().register(FormRegistry, {
    label: "Name",
    type: "text",
  }),
  address: z.string().trim().nonempty().register(FormRegistry, {
    label: "Address",
    type: "text",
  }),
  location: z.string().trim().nonempty().register(FormRegistry, {
    label: "Location",
    type: "text",
  }),
  kvk: z.string().trim().nonempty().register(FormRegistry, {
    label: "KVK number",
    type: "text",
  }),
  vat: z.string().trim().nonempty().register(FormRegistry, {
    label: "VAT number",
    type: "text",
  }),
  iban: z.string().trim().nonempty().register(FormRegistry, {
    label: "Bank Account IBAN",
    type: "text",
  }),
  bic: z.string().trim().nonempty().register(FormRegistry, {
    label: "Bank Account BIC",
    type: "text",
  }),
});

export const descriptors = {
  index: descriptor("GET", "/business/", {
    response: Responses.jsx,
  }),
  save: descriptor("POST", "/business/", {
    body: Body.formData(makePostSchema(UpdateFormSchema)),
  }),
};

export const routes = [
  route(
    descriptors.index,
    async () => {
      const record = await business.get();

      return (
        <PageLayout title="Business">
          <SchemaBasedForm
            method="POST"
            action="/business/"
            schema={UpdateFormSchema}
            value={record}
          />
        </PageLayout>
      );
    },
  ),
  route(
    descriptors.save,
    async (_ctx, { body }) => {
      if (body.action === "save") {
        await business.set(body);
      }

      return redirect303(formatRoute(descriptors.index, {}));
    },
  ),
];
