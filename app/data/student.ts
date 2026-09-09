import z from "zod";

import core from "@/app/data/_core.ts";

const StudentRecordSchema = z.object({
  id: z.uuid(),
  status: z.literal(["active", "inactive"]),
  name: z.string().nonempty(),
  billing: z.object({
    name: z.string().nonempty(),
    address: z.string().nonempty(),
    location: z.string().nonempty(),
  }),
  contact: z.optional(z.object({
    email: z.email(),
    whatsapp: z.string(),
  })),
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

export type UpdateRequest = {
  name: string;
  billing: {
    name: string;
    address: string;
    location: string;
  };
  contact: {
    email: string;
    whatsapp: string;
  };
};

export default {
  async *list(
    owner: string,
    options?: { includeInactive: boolean },
  ): AsyncGenerator<StudentRecord> {
    for await (
      const entry of await core.list({ prefix: studentKeyAll(owner) })
    ) {
      const record = StudentRecordSchema.parse(entry.value);

      if (record.status === "inactive" && !options?.includeInactive) {
        continue;
      }

      yield record;
    }
  },

  async create(
    owner: string,
    req: CreateRequest,
  ) {
    const id = crypto.randomUUID();

    const record = StudentRecordSchema.encode({
      ...req,
      id,
      status: "active",
    });

    await core.set(studentKeyOne(owner, id), record);
  },

  async get(
    owner: string,
    id: string,
  ) {
    const entry = await core.get(studentKeyOne(owner, id));
    if (entry.versionstamp === null) {
      throw new Error("not found");
    }
    return StudentRecordSchema.parse(entry.value);
  },

  async update(
    owner: string,
    id: string,
    req: UpdateRequest,
  ) {
    const entry = await core.get(studentKeyOne(owner, id));
    if (entry.versionstamp === null) {
      throw new Error("not found");
    }

    const record = { ...req, id, status: "active" } satisfies StudentRecord;

    core.set(studentKeyOne(owner, id), StudentRecordSchema.encode(record));
  },

  async delete(
    owner: string,
    id: string,
  ) {
    const record = await this.get(owner, id);

    const updated = { ...record, status: "inactive" } satisfies StudentRecord;

    core.set(studentKeyOne(owner, id), StudentRecordSchema.encode(updated));
  },
};

function studentKeyOne(owner: string, id: string): Deno.KvKey {
  return [...studentKeyBase(owner), id];
}

function studentKeyAll(owner: string): Deno.KvKey {
  return studentKeyBase(owner);
}

function studentKeyBase(owner: string): Deno.KvKey {
  return ["owner", owner, "students"];
}
