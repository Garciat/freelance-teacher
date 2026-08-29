import z from "zod";

import { Ctx } from "@/lib/web/ctx.ts";
import { jsx, redirect303 } from "@/lib/web/respond.ts";

import {
  FormRegistry,
  makePostSchema,
  SchemaBasedForm,
} from "@/lib/web/forms.tsx";

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

const RegisterPostSchema = makePostSchema(RegisterFormSchema);

const DeleteSchema = z.object({});

export default {
  async index() {
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
              <tr>
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

  register() {
    return jsx(
      <PageLayout title="Students">
        <SchemaBasedForm
          schema={RegisterFormSchema}
          method="POST"
          action=""
        />
      </PageLayout>,
    );
  },

  registerPostSchema: RegisterPostSchema,

  async registerPost(
    ctx: Ctx,
    data: { body: z.output<typeof RegisterPostSchema> },
  ) {
    if (data.body.action === "cancel") {
      return redirect303(new URL("/students/", ctx.url));
    }

    await student.create({
      name: data.body.name,
      billing: {
        name: data.body.billing_name,
        address: data.body.billing_address,
        location: data.body.billing_location,
      },
    });

    return redirect303(new URL("/students/", ctx.url));
  },

  deleteSchema: DeleteSchema,

  async delete(
    ctx: Ctx,
    data: { path: { id: string }; body: z.output<typeof DeleteSchema> },
  ) {
    await student.delete(data.path.id);

    return redirect303(new URL("/students/", ctx.url));
  },
};
