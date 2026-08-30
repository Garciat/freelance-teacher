import z from "zod";

import { BodyParsers } from "@/lib/web/body.ts";
import {
  FormRegistry,
  makePostSchema,
  SchemaBasedForm,
} from "@/lib/web/forms.tsx";
import { jsx, redirect303 } from "@/lib/web/respond.ts";
import { route } from "@/lib/web/route.ts";

import student from "@/app/data/student.ts";
import { PageLayout } from "@/app/layouts/page.tsx";

const RegisterFormSchema = z.object({
  name: z.string().trim().nonempty().register(FormRegistry, {
    label: "Name",
    type: "text",
    placeholder: "John Student",
  }),
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
});

export const routes = [
  route(
    "GET",
    { pathname: "/students/" },
    {},
    async () => {
      const items = await Array.fromAsync(
        student.list(),
      );

      const displayItems = items.toSorted((a, b) =>
        a.status.localeCompare(b.status) || a.name.localeCompare(b.name)
      );

      return jsx(
        <PageLayout title="Students">
          <a href="/students/register">Register New Student</a>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((record) => (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>
                    <form method="GET" action={`/students/manage/${record.id}`}>
                      <button type="submit">Manage</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PageLayout>,
      );
    },
  ),
  route(
    "GET",
    { pathname: "/students/register" },
    {},
    () =>
      jsx(
        <PageLayout title="Students">
          <SchemaBasedForm
            schema={RegisterFormSchema}
            method="POST"
            action="/students/register"
          />
        </PageLayout>,
      ),
  ),
  route(
    "POST",
    { pathname: "/students/register" },
    {
      body: BodyParsers.formData(makePostSchema(RegisterFormSchema)),
    },
    async (ctx, { body }) => {
      if (body.action === "save") {
        await student.create({
          name: body.name,
          billing: {
            name: body.billing_name,
            address: body.billing_address,
            location: body.billing_location,
          },
        });
      }

      return redirect303(new URL("/students/", ctx.url));
    },
  ),
  route(
    "GET",
    { pathname: "/students/manage/:id" },
    {
      path: z.object({ id: z.uuid() }),
    },
    async (_ctx, { path }) => {
      const record = await student.get(path.id);

      return jsx(
        <PageLayout title="Students">
          <SchemaBasedForm
            schema={RegisterFormSchema}
            method="POST"
            action={`/students/manage/${path.id}`}
            value={{
              name: record.name,
              billing_name: record.billing.name,
              billing_address: record.billing.address,
              billing_location: record.billing.location,
            }}
          />
        </PageLayout>,
      );
    },
  ),
  route(
    "POST",
    { pathname: "/students/manage/:id" },
    {
      path: z.object({ id: z.uuid() }),
      body: BodyParsers.formData(makePostSchema(RegisterFormSchema)),
    },
    async (ctx, { path, body }) => {
      if (body.action === "cancel") {
        return redirect303(new URL(`/students/`, ctx.url));
      }

      await student.update(
        path.id,
        {
          name: body.name,
          billing: {
            name: body.billing_name,
            address: body.billing_address,
            location: body.billing_location,
          },
        },
      );

      return redirect303(new URL(`/students/manage/${path.id}`, ctx.url));
    },
  ),
  route(
    "POST",
    { pathname: "/students/delete/:id" },
    {
      path: z.object({
        id: z.uuid(),
      }),
      body: BodyParsers.formData(z.object({})),
    },
    async (ctx, { path }) => {
      await student.delete(path.id);

      return redirect303(new URL("/students/", ctx.url));
    },
  ),
];
