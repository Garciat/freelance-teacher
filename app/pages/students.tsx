import { SchemaBasedForm } from "@/lib/web/forms.tsx";
import { Form, Link } from "@/lib/web/link.tsx";
import { jsx, redirect303 } from "@/lib/web/respond.ts";
import { formatRoute, route } from "@/lib/web/route.ts";

import { Student } from "@/app/data/student.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";
import { Extras } from "@/app/pages/_extra.ts";
import { PagesStudent, RegisterFormSchema } from "@/app/pages/student/_meta.ts";

// TODO split into app/pages/student/*

export const routes = [
  route(
    PagesStudent.index,
    async ({ user }) => {
      const items = await Array.fromAsync(
        Student.list(user.id),
      );

      const displayItems = items.toSorted((a, b) =>
        a.status.localeCompare(b.status) || a.name.localeCompare(b.name)
      );

      return (
        <PageLayout title="Students" user={user}>
          <Link to={PagesStudent.register.get}>Register New Student</Link>
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
                    <Form to={PagesStudent.manage.get} path={{ id: record.id }}>
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
    { user: Extras.User.required() },
  ),
  route(
    PagesStudent.register.get,
    ({ user }) => (
      <PageLayout title="Students" user={user}>
        <Form to={PagesStudent.register.post}>
          <SchemaBasedForm
            schema={RegisterFormSchema}
          />
        </Form>
      </PageLayout>
    ),
    { user: Extras.User.required() },
  ),
  route(
    PagesStudent.register.post,
    async ({ body, user }) => {
      if (body.action === "save") {
        await Student.create(user.id, {
          name: body.name,
          billing: {
            name: body.billing_name,
            address: body.billing_address,
            location: body.billing_location,
          },
        });
      }

      return redirect303(formatRoute(PagesStudent.index, {}));
    },
    { user: Extras.User.required() },
  ),
  route(
    PagesStudent.manage.get,
    async ({ ctx, path, user }) => {
      const record = await Student.get(user.id, path.id);

      return jsx(
        <PageLayout title="Students" user={user}>
          <Form to={PagesStudent.manage.post} path={{ id: path.id }}>
            <input type="hidden" name="_referrer" value={ctx.referrer} />
            <SchemaBasedForm
              schema={RegisterFormSchema}
              value={{
                name: record.name,
                billing_name: record.billing.name,
                billing_address: record.billing.address,
                billing_location: record.billing.location,
                contact_email: record.contact?.email ?? "",
                contact_whatsapp: record.contact?.whatsapp ?? "",
              }}
            />
          </Form>
        </PageLayout>,
      );
    },
    { user: Extras.User.required() },
  ),
  route(
    PagesStudent.manage.post,
    async ({ path, body, user }) => {
      if (body.action === "cancel") {
        return redirect303(
          body._referrer ?? formatRoute(PagesStudent.index, {}),
        );
      }

      await Student.update(
        user.id,
        path.id,
        {
          name: body.name,
          billing: {
            name: body.billing_name,
            address: body.billing_address,
            location: body.billing_location,
          },
          contact: {
            email: body.contact_email,
            whatsapp: body.contact_whatsapp ?? "",
          },
        },
      );

      return redirect303(body._referrer ?? formatRoute(PagesStudent.index, {}));
    },
    { user: Extras.User.required() },
  ),
  route(
    PagesStudent.delete.post,
    async ({ path, user }) => {
      await Student.remove(user.id, path.id);

      return redirect303(formatRoute(PagesStudent.index, {}));
    },
    { user: Extras.User.required() },
  ),
];
