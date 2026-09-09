import z from "zod";
import { dinero, EUR } from "dinero.js";

import { BigDecimalCodec, BigIntCodec, IntegerCodec } from "@/lib/codecs.ts";
import { Body } from "@/lib/web/body.ts";
import { Form, Link } from "@/lib/web/link.tsx";
import { redirect303, Responses } from "@/lib/web/respond.ts";
import { descriptor, formatRoute, route } from "@/lib/web/route.ts";

import { Business } from "@/app/data/business.ts";
import { Invoice, InvoiceRecord } from "@/app/data/invoice.ts";
import { Student } from "@/app/data/student.ts";
import { renderInvoiceToBuffer } from "@/app/shared/invoice.tsx";

import { Extras } from "@/app/pages/_extra.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";

export const descriptors = {
  index: descriptor("GET", "/invoices/", { response: Responses.jsx }),

  create: {
    get: descriptor("GET", "/invoices/create", { response: Responses.jsx }),

    post: descriptor("POST", "/invoices/create", {
      body: Body.formData(z.object({
        sequence_no: BigIntCodec,
        student_id: z.uuid(),
        lesson_count: IntegerCodec,
        hourly_rate: BigDecimalCodec,
        vat_rate: z.enum(["0", "21"]),
        deadline_days: IntegerCodec,
      })),
    }),
  },

  invoice: {
    markFinalized: descriptor("POST", "/invoices/:id/finalize", {
      path: z.object({ id: BigIntCodec }),
    }),

    markPaid: descriptor("POST", "/invoices/:id/paid", {
      path: z.object({ id: BigIntCodec }),
    }),

    document: descriptor("GET", "/invoices/:id/document", {
      path: z.object({ id: BigIntCodec }),
    }),
  },
};

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

export const routes = [
  route(
    descriptors.index,
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
          <Link to={descriptors.create.get}>New Invoice</Link>
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
                        to={descriptors.invoice.document}
                        path={{ id: invoice.sequenceNumber }}
                      >
                        <button type="submit">View</button>
                      </Form>

                      <Form
                        to={descriptors.invoice.markFinalized}
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
                        to={descriptors.invoice.markPaid}
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
  ),

  route(
    descriptors.create.get,
    async ({ user }) => {
      const [students, lastSeqNo] = await Promise.all([
        Array.fromAsync(Student.list(user.id)),
        Invoice.maxSequenceNumber(user.id),
      ]);

      const nextSeqNo = 1n +
        (lastSeqNo ?? BigInt(Temporal.Now.plainDateISO().year) * 10_000n);

      return (
        <PageLayout title="Invoices" user={user}>
          <Form to={descriptors.create.post}>
            <div className="schema-form">
              <div className="form-group">
                <label htmlFor="sequence_no">Sequence Number</label>
                <input
                  name="sequence_no"
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={Number(nextSeqNo)}
                  defaultValue={Number(nextSeqNo)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="student_id">Student</label>
                <select id="student_id" name="student_id">
                  {students.toSorted(
                    (a, b) => a.name.localeCompare(b.name),
                  ).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="lesson_count">Lesson Count</label>
                <input
                  name="lesson_count"
                  type="number"
                  inputMode="numeric"
                  step={1}
                  defaultValue={10}
                />
              </div>
              <div className="form-group">
                <label htmlFor="hourly_rate">Hourly Rate</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    columnGap: "1em",
                  }}
                >
                  <span>EUR</span>
                  <input
                    name="hourly_rate"
                    type="number"
                    inputMode="decimal"
                    step={0.01}
                    defaultValue={50}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="vat_rate">VAT Rate</label>
                <select name="vat_rate">
                  <option value="21">21%</option>
                  <option value="0">0%</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="deadline_days">Deadline (days)</label>
                <input
                  name="deadline_days"
                  type="number"
                  inputMode="numeric"
                  step={1}
                  defaultValue={7}
                />
              </div>
              <footer className="actions">
                <button
                  type="submit"
                  name="action"
                  value="save"
                >
                  OK
                </button>
                <button
                  type="submit"
                  name="action"
                  value="cancel"
                  formNoValidate
                >
                  Cancel
                </button>
              </footer>
            </div>
          </Form>
        </PageLayout>
      );
    },
    { user: Extras.User.required() },
  ),

  route(
    descriptors.create.post,
    async ({ body, user }) => {
      const [business, student] = await Promise.all([
        Business.get(user.id),
        Student.get(user.id, body.student_id),
      ]);

      const created = Temporal.Now.zonedDateTimeISO();

      const deadline = created.add({ days: body.deadline_days });

      const invoice = await renderInvoiceToBuffer({
        title: `Invoice ${body.sequence_no}`,
        sender: business,
        client: {
          name: student.billing.name,
          address: student.billing.address,
          zipCity: student.billing.location,
        },
        invoiceMeta: {
          number: body.sequence_no.toString(),
          date: created.toPlainDate(),
          dueDate: created
            .add({ days: body.deadline_days })
            .toPlainDate(),
          paymentTerms: body.deadline_days,
        },
        items: [
          {
            description: `Lessen voor ${student.name}`,
            qty: body.lesson_count,
            price: body.hourly_rate.toNumber(),
            vatPct: Number.parseInt(body.vat_rate),
          },
        ],
      });

      await Invoice.create(user.id, {
        sequenceNumber: BigInt(body.sequence_no),
        recipient: {
          studentId: student.id,
        },
        amounts: {
          vat: dinero({ amount: 0n, currency: EUR }),
          preTaxTotal: dinero({ amount: 0n, currency: EUR }),
        },
        conditions: {
          deadline: deadline.toInstant(),
        },
        document: {
          invoice,
        },
      });

      return redirect303(formatRoute(descriptors.index, {}));
    },
    { user: Extras.User.required() },
  ),

  route(
    descriptors.invoice.document,
    async ({ path, user }) => {
      const invoice = await Invoice.get(user.id, path.id);

      return new Response(invoice.document.invoice, {
        headers: {
          "content-type": "application/pdf",
          "content-disposition":
            `inline; filename="invoice-${invoice.sequenceNumber}.pdf"`,
        },
      });
    },
    { user: Extras.User.required() },
  ),

  route(
    descriptors.invoice.markFinalized,
    async ({ path, user }) => {
      await Invoice.markFinalized(user.id, path.id);

      return redirect303(formatRoute(descriptors.index, {}));
    },
    { user: Extras.User.required() },
  ),

  route(
    descriptors.invoice.markPaid,
    async ({ path, user }) => {
      await Invoice.markPaid(user.id, path.id);

      return redirect303(formatRoute(descriptors.index, {}));
    },
    { user: Extras.User.required() },
  ),
];
