import { Form, Link } from "@/lib/web/link.tsx";
import { route } from "@/lib/web/route.ts";

import { Invoice, InvoiceRecord } from "@/app/data/invoice.ts";
import { Student } from "@/app/data/student.ts";

import { Extras } from "@/app/pages/_extra.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";
import { PagesInvoice } from "@/app/pages/invoice/_meta.ts";

type InvoiceState = "draft" | "pending" | "paid";

function getState(invoice: InvoiceRecord): InvoiceState {
  if (invoice.events.paid) {
    return "paid";
  } else if (invoice.events.finalized) {
    return "pending";
  } else {
    return "draft";
  }
}

const stateLabels = {
  "draft": "Draft",
  "pending": "Pending",
  "paid": "Paid",
} as const;

export const RouteInvoiceIndex = route(
  PagesInvoice.index,
  async ({ user }) => {
    const invoices = await Array.fromAsync(Invoice.list(user.id));

    const students = new Map(
      await Array.fromAsync(
        async function* () {
          for await (const student of Student.list(user.id)) {
            yield [student.id, student];
          }
        }(),
      ),
    );

    return (
      <PageLayout title="Invoices" user={user}>
        <Link to={PagesInvoice.create.get}>New Invoice</Link>
        <table>
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Student</th>
              <th>Date</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td>{invoice.sequenceNumber}</td>
                <td>{students.get(invoice.recipient.studentId)?.name}</td>
                <td>
                  {invoice.events.created.timestamp
                    .toZonedDateTimeISO("Europe/Amsterdam")
                    .toLocaleString("nl", { dateStyle: "short" })}
                </td>
                <td>{stateLabels[getState(invoice)]}</td>
                <td>
                  <div style={{ display: "flex", columnGap: "5px" }}>
                    <Form
                      to={PagesInvoice.invoice.document}
                      path={{ id: invoice.sequenceNumber }}
                    >
                      <button type="submit">View</button>
                    </Form>

                    <Form
                      to={PagesInvoice.invoice.markFinalized}
                      path={{ id: invoice.sequenceNumber }}
                      style={{
                        display: getState(invoice) === "draft"
                          ? "block"
                          : "none",
                      }}
                    >
                      <button type="submit">Finalize</button>
                    </Form>

                    <Form
                      to={PagesInvoice.invoice.send.get}
                      path={{ id: invoice.sequenceNumber }}
                      style={{
                        display: getState(invoice) === "pending"
                          ? "block"
                          : "none",
                      }}
                    >
                      <button type="submit">Send</button>
                    </Form>

                    <Form
                      to={PagesInvoice.invoice.markPaid}
                      path={{ id: invoice.sequenceNumber }}
                      style={{
                        display: getState(invoice) === "pending"
                          ? "block"
                          : "none",
                      }}
                    >
                      <button type="submit">Paid</button>
                    </Form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageLayout>
    );
  },
  { user: Extras.User.required() },
);
