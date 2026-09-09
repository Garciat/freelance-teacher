import z from "zod";

import { BigDecimalCodec, IntegerCodec } from "@/lib/codecs.ts";
import { Body } from "@/lib/web/body.ts";
import { Form } from "@/lib/web/link.tsx";
import { Responses } from "@/lib/web/respond.ts";
import { descriptor, route } from "@/lib/web/route.ts";

import { Business } from "@/app/data/business.ts";
import { Invoice } from "@/app/data/invoice.ts";
import { Student } from "@/app/data/student.ts";
import { renderInvoiceToBlob } from "@/app/shared/invoice.tsx";

import { Extras } from "@/app/pages/_extra.ts";
import { PageLayout } from "@/app/pages/_layouts/page.tsx";

export const descriptors = {
  index: descriptor("GET", "/invoices/", { response: Responses.jsx }),

  create: descriptor("POST", "/invoices/create", {
    body: Body.formData(z.object({
      sequence_no: IntegerCodec,
      student_id: z.uuid(),
      lesson_count: IntegerCodec,
      hourly_rate: BigDecimalCodec,
      vat_rate: z.enum(["0", "21"]),
      deadline_days: IntegerCodec,
    })),
  }),
};

export const routes = [
  route(
    descriptors.index,
    async ({ user }) => {
      const [students, lastSeqNo] = await Promise.all([
        Array.fromAsync(Student.list(user.id)),
        Invoice.maxSequenceNumber(user.id),
      ]);

      const nextSeqNo = 1n +
        (lastSeqNo ?? BigInt(Temporal.Now.plainDateISO().year) * 10_000n);

      return (
        <PageLayout title="Invoices" user={user}>
          <Form to={descriptors.create}>
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
    descriptors.create,
    async ({ body, user }) => {
      const [business, student] = await Promise.all([
        Business.get(user.id),
        Student.get(user.id, body.student_id),
      ]);

      const created = Temporal.Now.zonedDateTimeISO();

      return new Response(
        await renderInvoiceToBlob({
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
        }),
        {
          headers: {
            "content-disposition":
              `inline; filename="invoice-${body.sequence_no}.pdf"`,
          },
        },
      );
    },
    { user: Extras.User.required() },
  ),
];
