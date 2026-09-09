import { Form, Link } from "@/lib/web/link.tsx";
import { route } from "@/lib/web/route.ts";

import { Invoice, InvoiceRecord } from "@/app/data/invoice.ts";
import { Student } from "@/app/data/student.ts";

import { Extras } from "@/app/pages/_extra.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";
import { PagesInvoice } from "@/app/pages/invoice/_meta.ts";
import { PagesStudent } from "@/app/pages/student/_meta.ts";

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

    const invoicesByMonth = Map.groupBy(
      invoices,
      (invoice) =>
        invoice.events.created.timestamp
          .toZonedDateTimeISO("Europe/Amsterdam")
          .withCalendar("gregory")
          .toPlainDate()
          .toPlainYearMonth()
          .toString(),
    );

    const students = new Map(
      await Array.fromAsync(
        async function* () {
          for await (const student of Student.list(user.id)) {
            yield [student.id, student];
          }
        }(),
      ),
    );

    const formatEventDate = (ts: Temporal.Instant) =>
      ts.toZonedDateTimeISO("Europe/Amsterdam")
        .toLocaleString("nl", { dateStyle: "short" });

    return (
      <PageLayout title="Invoices" user={user}>
        <Link to={PagesInvoice.create.get}>New Invoice</Link>
        {invoicesByMonth.entries().map(([yearMonthStr, invoices]) => (
          <section>
            <h2>
              {Temporal.PlainYearMonth.from(yearMonthStr)
                .toLocaleString("en", { dateStyle: "long" })}
            </h2>
            {invoices.map((invoice, index) => (
              <article key={index} className="item-details">
                <div className="item-property">
                  <h4>Invoice No.</h4>
                  <div className="horizontal-stack">
                    <span>{invoice.sequenceNumber}</span>
                    <Link
                      to={PagesInvoice.invoice.document}
                      path={{ id: invoice.sequenceNumber }}
                      className="pill"
                    >
                      PDF
                    </Link>
                  </div>
                </div>
                <div className="item-property">
                  <h4>Student</h4>
                  <div className="horizontal-stack">
                    <Link
                      to={PagesStudent.manage.get}
                      path={{
                        id: students.get(invoice.recipient.studentId)!.id,
                      }}
                      className="navigate"
                    >
                      {students.get(invoice.recipient.studentId)!.name}
                    </Link>

                    <Link
                      to={PagesInvoice.invoice.send.get}
                      path={{ id: invoice.sequenceNumber }}
                      className="pill"
                    >
                      Send Invoice
                    </Link>
                  </div>
                </div>
                <div className="horizontal-fill">
                  <div className="item-property">
                    <h4>Created</h4>
                    <p>{formatEventDate(invoice.events.created.timestamp)}</p>
                  </div>
                  {invoice.events.finalized && (
                    <div className="item-property">
                      <h4>Finalized</h4>
                      <p>
                        {formatEventDate(invoice.events.finalized.timestamp)}
                      </p>
                    </div>
                  )}
                  {invoice.events.paid && (
                    <div className="item-property">
                      <h4>Paid</h4>
                      <p>{formatEventDate(invoice.events.paid.timestamp)}</p>
                    </div>
                  )}
                </div>
                <div className="item-property">
                  <h4>Status</h4>
                  <div className="horizontal-stack">
                    <span>{stateLabels[getState(invoice)]}</span>
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
                      to={PagesInvoice.invoice.markPaid}
                      path={{ id: invoice.sequenceNumber }}
                      style={{
                        display: getState(invoice) === "pending"
                          ? "block"
                          : "none",
                      }}
                    >
                      <button type="submit">Confirm Payment</button>
                    </Form>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ))}
      </PageLayout>
    );
  },
  { user: Extras.User.required() },
);
