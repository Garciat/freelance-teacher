import z from "zod";

import core from "@/app/data/core.ts";

const BusinessRecordSchema = z.object({
  name: z.string(),
  address: z.string(),
  location: z.string(),
  kvk: z.string(),
  vat: z.string(),
  iban: z.string(),
  bic: z.string(),
});

type SetRequest = z.output<typeof BusinessRecordSchema>;

const fallback = {
  name: "Amsterdam Tech Solutions B.V.",
  address: "Keizersgracht 421",
  location: "1016 EK Amsterdam",
  kvk: "12345678",
  vat: "NL812345678B01",
  iban: "NL91 ABNA 0412 3456 78",
  bic: "ABNANL2A",
};

export default {
  async get() {
    const entry = await core.get(["business"]);

    if (entry.versionstamp === null) {
      await this.set(fallback);
      return fallback;
    }

    return BusinessRecordSchema.parse(entry.value);
  },

  async set(req: SetRequest) {
    const record = BusinessRecordSchema.encode(req);

    await core.set(["business"], record);
  },
};
