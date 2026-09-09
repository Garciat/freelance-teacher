import { Buffer } from "node:buffer";

import { Form } from "@/lib/web/link.tsx";
import { redirect303 } from "@/lib/web/respond.ts";
import { formatRoute, route } from "@/lib/web/route.ts";

import { Business } from "@/app/data/business.ts";
import { Invoice } from "@/app/data/invoice.ts";
import { Student } from "@/app/data/student.ts";

import { Extras } from "@/app/pages/_extra.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";
import { ResendClient } from "@/app/email.ts";
import { renderToString } from "react-dom/server";
import { PagesInvoice } from "@/app/pages/invoice/_meta.ts";

export const RouteInvoiceSend = {
  get: route(
    PagesInvoice.invoice.send.get,
    async ({ path, user }) => {
      const invoice = await Invoice.get(user.id, path.id);

      const student = await Student.get(user.id, invoice.recipient.studentId);

      const email = student.contact?.email;

      if (!email) {
        return (
          <PageLayout title="Invoices" user={user}>
            <p>Student does not have an e-mail set up.</p>
          </PageLayout>
        );
      }

      return (
        <PageLayout title="Invoices" user={user}>
          <p>Send invoice to {student.contact?.email}?</p>
          <Form to={PagesInvoice.invoice.send.post} path={path}>
            <button type="submit">Send</button>
          </Form>
        </PageLayout>
      );
    },
    { user: Extras.User.required() },
  ),

  post: route(
    PagesInvoice.invoice.send.post,
    async ({ path, user }) => {
      const business = await Business.get(user.id);

      const invoice = await Invoice.get(user.id, path.id);

      const student = await Student.get(user.id, invoice.recipient.studentId);

      const email = student.contact?.email;

      if (!email) {
        return new Response("no email", { status: 400 });
      }

      const result = await ResendClient.emails.send({
        from: "freelance-teacher@apps.garciat.com",
        to: email,
        subject: `Your invoice from ${business.name}`,
        html: renderToString(
          <>
            <p>Dear {student.billing.name},</p>
            <p></p>
            <p>This is your invoice.</p>
            <p></p>
            <p>Thank you,</p>
            <p>{business.name}</p>
          </>,
        ),
        attachments: [
          {
            content: Buffer.from(invoice.document.invoice),
            filename: `invoice-${invoice.sequenceNumber}.pdf`,
          },
        ],
      });

      if (result.error) {
        throw result.error;
      }

      return redirect303(formatRoute(PagesInvoice.index, {}));
    },
    { user: Extras.User.required() },
  ),
} as const;
