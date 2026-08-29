import z from "zod";

import core from "@/app/data/core.ts";

const StudentRecordSchema = z.object({
  id: z.uuid(),
  status: z.literal(["active", "inactive"]),
  name: z.string().nonempty(),
  billing: z.object({
    name: z.string().nonempty(),
    address: z.string().nonempty(),
    location: z.string().nonempty(),
  }),
});

type StudentRecord = z.output<typeof StudentRecordSchema>;

export type CreateRequest = {
  name: string;
  billing: {
    name: string;
    address: string;
    location: string;
  };
};

export default {
  async *list(
    options?: { includeInactive: boolean },
  ): AsyncGenerator<StudentRecord> {
    for await (const entry of await core.list({ prefix: ["students"] })) {
      const record = StudentRecordSchema.parse(entry.value);

      if (record.status === "inactive" && !options?.includeInactive) {
        continue;
      }

      yield record;
    }
  },

  async create(req: CreateRequest) {
    const id = crypto.randomUUID();

    const record = StudentRecordSchema.encode({
      ...req,
      id,
      status: "active",
    });

    await core.set(["students", id], record);
  },

  async get(id: string) {
    const entry = await core.get(["students", id]);
    if (entry.versionstamp === null) {
      throw new Error("not found");
    }
    return StudentRecordSchema.parse(entry.value);
  },

  async delete(id: string) {
    const record = await this.get(id);

    const updated = { ...record, status: "inactive" } satisfies StudentRecord;

    core.set(["students", id], StudentRecordSchema.encode(updated));
  },
};
