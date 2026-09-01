import z from "zod";

import { Body } from "@/lib/web/body.ts";
import {
  FormRegistry,
  makePostSchema,
  SchemaBasedForm,
} from "@/lib/web/forms.tsx";
import { Form, Link } from "@/lib/web/link.tsx";
import { jsx, redirect303, Responses } from "@/lib/web/respond.ts";
import { descriptor, formatRoute, route } from "@/lib/web/route.ts";

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

export const descriptors = {
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

export const routes = [
  route(
    descriptors.index,
    async () => {
      const items = await Array.fromAsync(
        student.list(),
      );

      const displayItems = items.toSorted((a, b) =>
        a.status.localeCompare(b.status) || a.name.localeCompare(b.name)
      );

      return (
        <PageLayout title="Students">
          <Link to={descriptors.register.get}>Register New Student</Link>
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
                    <Form to={descriptors.manage.get} path={{ id: record.id }}>
                      <button type="submit">Manage</button>
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PageLayout>
      );
    },
  ),
  route(
    descriptors.register.get,
    () => (
      <PageLayout title="Students">
        <Form to={descriptors.register.post}>
          <SchemaBasedForm
            schema={RegisterFormSchema}
          />
        </Form>
      </PageLayout>
    ),
  ),
  route(
    descriptors.register.post,
    async (_ctx, { body }) => {
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

      return redirect303(formatRoute(descriptors.index, {}));
    },
  ),
  route(
    descriptors.manage.get,
    async (_ctx, { path }) => {
      const record = await student.get(path.id);

      return jsx(
        <PageLayout title="Students">
          <Form to={descriptors.manage.post} path={{ id: path.id }}>
            <SchemaBasedForm
              schema={RegisterFormSchema}
              value={{
                name: record.name,
                billing_name: record.billing.name,
                billing_address: record.billing.address,
                billing_location: record.billing.location,
              }}
            />
          </Form>
        </PageLayout>,
      );
    },
  ),
  route(
    descriptors.manage.post,
    async (_ctx, { path, body }) => {
      if (body.action === "cancel") {
        return redirect303(formatRoute(descriptors.index, {}));
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

      return redirect303(formatRoute(descriptors.index, {}));
    },
  ),
  route(
    descriptors.delete.post,
    async (_ctx, { path }) => {
      await student.delete(path.id);

      return redirect303(formatRoute(descriptors.index, {}));
    },
  ),
];
