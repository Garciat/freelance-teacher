import z from "zod";
import { BigDecimal } from "bigdecimal";
import { Dinero, dinero, toSnapshot } from "dinero.js";

export const IntegerCodec = z.codec(
  z.string().regex(z.regexes.integer),
  z.int(),
  {
    decode: (value) => Number.parseInt(value, 10),
    encode: (value) => value.toString(),
  },
);

export const BigIntCodec = z.codec(
  z.string().regex(z.regexes.integer),
  z.bigint(),
  {
    decode: (value) => BigInt(value),
    encode: (value) => value.toString(),
  },
);

export const BigDecimalCodec = z.codec(
  z.string().regex(/^\d+(\.\d{1,2})?$/),
  z.instanceof(BigDecimal),
  {
    decode: (value) => new BigDecimal(value),
    encode: (decimal) => decimal.toString(),
  },
);

export const InstantISO8601 = z.codec(
  z.iso.datetime(),
  z.instanceof(Temporal.Instant),
  {
    decode: (timestamp) => Temporal.Instant.from(timestamp),
    encode: (instant) => instant.toString(),
  },
);

export const MoneyAmountCodec = z.codec(
  z.strictObject({
    amount: z.bigint(),
    currency: z.strictObject({
      code: z.string(),
      base: z.union([
        z.bigint(),
        z.readonly(z.array(z.bigint())),
      ]),
      exponent: z.bigint(),
    }),
    scale: z.bigint(),
  }),
  z.custom<Dinero<bigint>>(),
  {
    decode: (snapshot) => dinero(snapshot),
    encode: (amount) => toSnapshot(amount),
  },
);
