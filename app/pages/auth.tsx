import z from "zod";
import { OAuth2Client } from "npm:google-auth-library@11.0.2";

import { Body } from "@/lib/web/body.ts";
import { redirect303, Responses } from "@/lib/web/respond.ts";
import { descriptor, formatRoute, route } from "@/lib/web/route.ts";

import { PageLayout } from "@/app/pages/_layouts/page.tsx";
import { AuthSession } from "@/app/session.ts";

const GoogleAuthClient = new OAuth2Client(
  JSON.parse(await Deno.readTextFile(`${Deno.cwd()}/google.secret.json`)),
);

export const descriptors = {
  login: descriptor("GET", "/auth/login", { response: Responses.jsx }),
  logout: descriptor("GET", "/auth/logout", {}),

  google: {
    callback: descriptor("POST", "/auth/google/callback", {
      body: Body.formData(z.object({
        credential: z.jwt(),
      })),
    }),
  },
};

export const routes = [
  route(
    descriptors.login,
    ({ ctx }) => (
      <PageLayout title="Login">
        <script src="https://accounts.google.com/gsi/client" async></script>

        <div
          id="g_id_onload"
          data-client_id="922992323762-2k1lmb5f96m2nmrf2vfhadjbgbqbosdi.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="redirect"
          data-login_uri={new URL(
            formatRoute(descriptors.google.callback, {}),
            ctx.url,
          ).toString()}
          data-itp_support="true"
        >
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="g_id_signin"
            data-type="standard"
            data-shape="rectangular"
            data-theme="filled_blue"
            data-text="signin_with"
            data-size="large"
            data-logo_alignment="left"
          >
          </div>
        </div>
      </PageLayout>
    ),
  ),

  route(
    descriptors.logout,
    () => (
      new Response("", {
        status: 303,
        headers: AuthSession.dropCookie(
          new Headers({
            "location": "/",
          }),
        ),
      })
    ),
  ),

  // Google
  route(
    descriptors.google.callback,
    async ({ body }) => {
      const ticket = await GoogleAuthClient.verifyIdToken({
        idToken: body.credential,
      });

      const email = ticket.getPayload()?.email;

      if (!email) {
        return redirect303(formatRoute(descriptors.login, {}));
      }

      return new Response("", {
        status: 303,
        headers: await AuthSession.setCookie(
          { email },
          new Headers({ "location": "/" }),
        ),
      });
    },
  ),
];
