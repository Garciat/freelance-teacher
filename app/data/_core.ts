console.log(`DENO_KV_PATH=${Deno.env.get("DENO_KV_PATH")}`);
const kv = await Deno.openKv(Deno.env.get("DENO_KV_PATH"));

export default {
  async list(selector: Deno.KvListSelector, options?: Deno.KvListOptions) {
    return await kv.list(selector, options);
  },

  async get(key: Deno.KvKey) {
    return await kv.get(key);
  },

  async set(key: Deno.KvKey, value: unknown) {
    return await kv.set(key, value);
  },

  async delete(key: Deno.KvKey) {
    return await kv.delete(key);
  },
};
