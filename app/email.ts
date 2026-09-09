import { Resend } from "npm:resend@6.26.0";

export const ResendClient = new Resend(Deno.env.get("RESEND_API_KEY")!);
